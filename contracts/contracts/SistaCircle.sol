// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SistaCircle
 * @dev A decentralized savings circle (stokvel) platform empowering women's financial independence
 * Built for BlockDAG network with enhanced security and transparency
 */
contract SistaCircle is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _circleIdCounter;
    
    // Circle states
    enum CircleState { Active, Completed, Cancelled }
    
    // Member status in a circle
    enum MemberStatus { Active, Defaulted, Withdrawn }
    
    struct Circle {
        uint256 id;
        string name;
        string description;
        address creator;
        uint256 contributionAmount;
        uint256 totalRounds;
        uint256 currentRound;
        uint256 maxMembers;
        uint256 memberCount;
        uint256 startTime;
        uint256 roundDuration; // in seconds
        CircleState state;
        bool requiresApproval;
        uint256 totalFunds;
        uint256 emergencyFund; // 5% of contributions for emergencies
        mapping(address => Member) members;
        mapping(uint256 => address) roundRecipients;
        address[] memberAddresses;
    }
    
    struct Member {
        bool isActive;
        MemberStatus status;
        uint256 contributionsMade;
        uint256 roundReceived; // 0 if not received yet
        uint256 lastContributionTime;
        string profileInfo; // IPFS hash for additional info
    }
    
    struct CircleInfo {
        uint256 id;
        string name;
        string description;
        address creator;
        uint256 contributionAmount;
        uint256 totalRounds;
        uint256 currentRound;
        uint256 maxMembers;
        uint256 memberCount;
        uint256 startTime;
        uint256 roundDuration;
        CircleState state;
        bool requiresApproval;
        uint256 totalFunds;
        uint256 emergencyFund;
    }
    
    // Mappings
    mapping(uint256 => Circle) public circles;
    mapping(address => uint256[]) public userCircles;
    mapping(address => bool) public verifiedMembers;
    
    // Events
    event CircleCreated(uint256 indexed circleId, address indexed creator, string name);
    event MemberJoined(uint256 indexed circleId, address indexed member);
    event ContributionMade(uint256 indexed circleId, address indexed member, uint256 amount);
    event PayoutDistributed(uint256 indexed circleId, address indexed recipient, uint256 amount);
    event CircleCompleted(uint256 indexed circleId);
    event EmergencyWithdrawal(uint256 indexed circleId, address indexed member, uint256 amount);
    event MemberVerified(address indexed member);
    
    // Modifiers
    modifier onlyCircleMember(uint256 _circleId) {
        require(circles[_circleId].members[msg.sender].isActive, "Not a circle member");
        _;
    }
    
    modifier circleExists(uint256 _circleId) {
        require(_circleId <= _circleIdCounter.current() && _circleId > 0, "Circle does not exist");
        _;
    }
    
    constructor() {}
    
    /**
     * @dev Create a new savings circle
     */
    function createCircle(
        string memory _name,
        string memory _description,
        uint256 _contributionAmount,
        uint256 _totalRounds,
        uint256 _maxMembers,
        uint256 _roundDuration,
        bool _requiresApproval
    ) external {
        require(_contributionAmount > 0, "Contribution amount must be positive");
        require(_totalRounds >= 2 && _totalRounds <= 52, "Invalid rounds (2-52)");
        require(_maxMembers >= 3 && _maxMembers <= 20, "Invalid member count (3-20)");
        require(_maxMembers == _totalRounds, "Members must equal rounds");
        require(_roundDuration >= 1 days, "Minimum round duration is 1 day");
        
        _circleIdCounter.increment();
        uint256 circleId = _circleIdCounter.current();
        
        Circle storage newCircle = circles[circleId];
        newCircle.id = circleId;
        newCircle.name = _name;
        newCircle.description = _description;
        newCircle.creator = msg.sender;
        newCircle.contributionAmount = _contributionAmount;
        newCircle.totalRounds = _totalRounds;
        newCircle.currentRound = 0;
        newCircle.maxMembers = _maxMembers;
        newCircle.memberCount = 1;
        newCircle.startTime = 0; // Will be set when circle is full
        newCircle.roundDuration = _roundDuration;
        newCircle.state = CircleState.Active;
        newCircle.requiresApproval = _requiresApproval;
        
        // Add creator as first member
        newCircle.members[msg.sender] = Member({
            isActive: true,
            status: MemberStatus.Active,
            contributionsMade: 0,
            roundReceived: 0,
            lastContributionTime: 0,
            profileInfo: ""
        });
        
        newCircle.memberAddresses.push(msg.sender);
        userCircles[msg.sender].push(circleId);
        
        emit CircleCreated(circleId, msg.sender, _name);
        emit MemberJoined(circleId, msg.sender);
    }
    
    /**
     * @dev Join an existing circle
     */
    function joinCircle(uint256 _circleId) external payable circleExists(_circleId) nonReentrant {
        Circle storage circle = circles[_circleId];
        
        require(circle.state == CircleState.Active, "Circle not active");
        require(circle.memberCount < circle.maxMembers, "Circle is full");
        require(!circle.members[msg.sender].isActive, "Already a member");
        require(circle.startTime == 0, "Circle already started");
        
        circle.members[msg.sender] = Member({
            isActive: true,
            status: MemberStatus.Active,
            contributionsMade: 0,
            roundReceived: 0,
            lastContributionTime: 0,
            profileInfo: ""
        });
        
        circle.memberAddresses.push(msg.sender);
        circle.memberCount++;
        userCircles[msg.sender].push(_circleId);
        
        // Start circle if full
        if (circle.memberCount == circle.maxMembers) {
            circle.startTime = block.timestamp;
            circle.currentRound = 1;
            _assignRoundRecipients(_circleId);
        }
        
        emit MemberJoined(_circleId, msg.sender);
    }
    
    /**
     * @dev Make a contribution to the circle
     */
    function contribute(uint256 _circleId) 
        external 
        payable 
        circleExists(_circleId) 
        onlyCircleMember(_circleId) 
        nonReentrant 
    {
        Circle storage circle = circles[_circleId];
        Member storage member = circle.members[msg.sender];
        
        require(circle.state == CircleState.Active, "Circle not active");
        require(circle.startTime > 0, "Circle not started");
        require(msg.value == circle.contributionAmount, "Incorrect contribution amount");
        require(member.status == MemberStatus.Active, "Member not in good standing");
        
        uint256 currentRoundEnd = circle.startTime + (circle.currentRound * circle.roundDuration);
        require(block.timestamp <= currentRoundEnd, "Round contribution period ended");
        
        uint256 expectedContributions = circle.currentRound;
        require(member.contributionsMade < expectedContributions, "Already contributed this round");
        
        member.contributionsMade++;
        member.lastContributionTime = block.timestamp;
        
        uint256 emergencyAmount = (msg.value * 5) / 100;
        uint256 circleAmount = msg.value - emergencyAmount;
        
        circle.totalFunds += circleAmount;
        circle.emergencyFund += emergencyAmount;
        
        emit ContributionMade(_circleId, msg.sender, msg.value);
        
        _checkRoundCompletion(_circleId);
    }
    
    /**
     * @dev Claim payout for the current round
     */
    function claimPayout(uint256 _circleId) 
        external 
        circleExists(_circleId) 
        onlyCircleMember(_circleId) 
        nonReentrant 
    {
        Circle storage circle = circles[_circleId];
        
        require(circle.roundRecipients[circle.currentRound] == msg.sender, "Not recipient for this round");
        require(circle.members[msg.sender].roundReceived == 0, "Already received payout");
        
        uint256 payout = circle.contributionAmount * circle.memberCount;
        require(circle.totalFunds >= payout, "Insufficient funds");
        
        circle.members[msg.sender].roundReceived = circle.currentRound;
        circle.totalFunds -= payout;
        
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Payout transfer failed");
        
        emit PayoutDistributed(_circleId, msg.sender, payout);
        
        if (circle.currentRound == circle.totalRounds) {
            circle.state = CircleState.Completed;
            emit CircleCompleted(_circleId);
        } else {
            circle.currentRound++;
        }
    }
    
    /**
     * @dev Emergency withdrawal (with penalties)
     */
    function emergencyWithdraw(uint256 _circleId) 
        external 
        circleExists(_circleId) 
        onlyCircleMember(_circleId) 
        nonReentrant 
    {
        Circle storage circle = circles[_circleId];
        Member storage member = circle.members[msg.sender];
        
        require(member.status == MemberStatus.Active, "Member not active");
        require(member.contributionsMade > 0, "No contributions made");
        
        uint256 totalContributed = member.contributionsMade * circle.contributionAmount;
        uint256 withdrawAmount = (totalContributed * 80) / 100;
        
        require(circle.emergencyFund >= withdrawAmount, "Insufficient emergency funds");
        
        member.status = MemberStatus.Withdrawn;
        circle.emergencyFund -= withdrawAmount;
        
        (bool success, ) = msg.sender.call{value: withdrawAmount}("");
        require(success, "Emergency withdrawal failed");
        
        emit EmergencyWithdrawal(_circleId, msg.sender, withdrawAmount);
    }
    
    function getCircleInfo(uint256 _circleId) 
        external 
        view 
        circleExists(_circleId) 
        returns (CircleInfo memory) 
    {
        Circle storage circle = circles[_circleId];
        return CircleInfo({
            id: circle.id,
            name: circle.name,
            description: circle.description,
            creator: circle.creator,
            contributionAmount: circle.contributionAmount,
            totalRounds: circle.totalRounds,
            currentRound: circle.currentRound,
            maxMembers: circle.maxMembers,
            memberCount: circle.memberCount,
            startTime: circle.startTime,
            roundDuration: circle.roundDuration,
            state: circle.state,
            requiresApproval: circle.requiresApproval,
            totalFunds: circle.totalFunds,
            emergencyFund: circle.emergencyFund
        });
    }
    
    function getMemberInfo(uint256 _circleId, address _member) 
        external 
        view 
        circleExists(_circleId) 
        returns (Member memory) 
    {
        return circles[_circleId].members[_member];
    }
    
    function getUserCircles(address _user) external view returns (uint256[] memory) {
        return userCircles[_user];
    }
    
    function getRoundRecipient(uint256 _circleId, uint256 _round) 
        external 
        view 
        circleExists(_circleId) 
        returns (address) 
    {
        return circles[_circleId].roundRecipients[_round];
    }
    
    function getTotalCircles() external view returns (uint256) {
        return _circleIdCounter.current();
    }
    
    function verifyMember(address _member) external onlyOwner {
        verifiedMembers[_member] = true;
        emit MemberVerified(_member);
    }
    
    // Internal helpers
    function _assignRoundRecipients(uint256 _circleId) internal {
        Circle storage circle = circles[_circleId];
        for (uint256 i = 0; i < circle.totalRounds; i++) {
            circle.roundRecipients[i + 1] = circle.memberAddresses[i];
        }
    }
    
    function _checkRoundCompletion(uint256 _circleId) internal {
        Circle storage circle = circles[_circleId];
        uint256 activeContributions = 0;
        for (uint256 i = 0; i < circle.memberAddresses.length; i++) {
            address memberAddr = circle.memberAddresses[i];
            if (
                circle.members[memberAddr].status == MemberStatus.Active &&
                circle.members[memberAddr].contributionsMade >= circle.currentRound
            ) {
                activeContributions++;
            }
        }
        // Hook for completion logic if needed
        activeContributions;
    }
    
    receive() external payable {}
}
