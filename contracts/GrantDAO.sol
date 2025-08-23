// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EmpowerToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


/**
 * @title GrantDAO
 * @dev Decentralized grant funding system with quadratic voting
 */
contract GrantDAO is ReentrancyGuard, Ownable {
    EmpowerToken public immutable empowerToken;
    
    struct Grant {
        address creator;
        string title;
        string description;
        uint256 requestedAmount;
        uint256 totalVotes;
        uint256 fundingDeadline;
        bool isActive;
        bool isFunded;
        uint256 fundingRound;
    }
    
    struct Vote {
        uint256 votePower;
        uint256 timestamp;
        bool hasVoted;
    }
    
    uint256 public currentFundingRound = 1;
    uint256 public totalGrantPool = 0;
    uint256 public votingPeriod = 7 days;
    uint256 public fundingPeriod = 30 days;
    
    Grant[] public grants;
    mapping(uint256 => mapping(address => Vote)) public votes; // grantId => voter => Vote
    mapping(uint256 => uint256) public roundTotalVotes; // round => total votes
    
    event GrantCreated(uint256 indexed grantId, address indexed creator, string title, uint256 requestedAmount);
    event VoteCast(uint256 indexed grantId, address indexed voter, uint256 votePower);
    event GrantFunded(uint256 indexed grantId, address indexed creator, uint256 amount);
    event FundingRoundStarted(uint256 indexed round, uint256 totalPool);
    
    constructor(address _empowerTokenAddress) Ownable(msg.sender) {
        empowerToken = EmpowerToken(_empowerTokenAddress);
    }
    
    /**
     * @dev Create a new grant proposal
     */
    function createGrant(
        string memory _title,
        string memory _description,
        uint256 _requestedAmount
    ) public {
        require(_requestedAmount > 0, "Amount must be positive");
        require(bytes(_title).length > 0, "Title required");
        
        uint256 grantId = grants.length;
        grants.push(Grant({
            creator: msg.sender,
            title: _title,
            description: _description,
            requestedAmount: _requestedAmount,
            totalVotes: 0,
            fundingDeadline: block.timestamp + fundingPeriod,
            isActive: true,
            isFunded: false,
            fundingRound: currentFundingRound
        }));
        
        emit GrantCreated(grantId, msg.sender, _title, _requestedAmount);
    }
    
    /**
     * @dev Cast a vote using quadratic voting
     */
    function castVote(uint256 _grantId, uint256 _votePower) public nonReentrant {
        require(_grantId < grants.length, "Invalid grant ID");
        Grant storage grant = grants[_grantId];
        require(grant.isActive, "Grant is not active");
        require(block.timestamp < grant.fundingDeadline, "Voting period ended");
        require(!votes[_grantId][msg.sender].hasVoted, "Already voted");
        
        // Calculate quadratic vote cost
        uint256 voteCost = _votePower * _votePower;
        
        // Transfer tokens for voting
        bool success = empowerToken.transferFrom(msg.sender, address(this), voteCost);
        require(success, "Token transfer failed");
        
        votes[_grantId][msg.sender] = Vote({
            votePower: _votePower,
            timestamp: block.timestamp,
            hasVoted: true
        });
        
        grant.totalVotes += _votePower;
        roundTotalVotes[currentFundingRound] += _votePower;
        
        emit VoteCast(_grantId, msg.sender, _votePower);
    }
    
    /**
     * @dev Fund top grants at the end of voting period
     */
    function fundTopGrants() public onlyOwner {
        require(block.timestamp >= grants[0].fundingDeadline, "Funding period not ended");
        
        // Sort grants by votes (simplified - in production use a more efficient method)
        uint256[] memory grantIds = new uint256[](grants.length);
        for (uint i = 0; i < grants.length; i++) {
            grantIds[i] = i;
        }
        
        // Simple bubble sort by votes (for demo purposes)
        for (uint i = 0; i < grantIds.length - 1; i++) {
            for (uint j = 0; j < grantIds.length - i - 1; j++) {
                if (grants[grantIds[j]].totalVotes < grants[grantIds[j + 1]].totalVotes) {
                    (grantIds[j], grantIds[j + 1]) = (grantIds[j + 1], grantIds[j]);
                }
            }
        }
        
        // Fund top grants based on available pool
        uint256 remainingPool = totalGrantPool;
        uint256 fundedCount = 0;
        
        for (uint i = 0; i < grantIds.length && remainingPool > 0; i++) {
            uint256 grantId = grantIds[i];
            Grant storage grant = grants[grantId];
            
            if (grant.isActive && !grant.isFunded && grant.fundingRound == currentFundingRound) {
                uint256 fundingAmount = grant.requestedAmount;
                if (fundingAmount > remainingPool) {
                    fundingAmount = remainingPool;
                }
                
                if (fundingAmount > 0) {
                    // Transfer funds to grant creator
                    bool success = empowerToken.transfer(grant.creator, fundingAmount);
                    if (success) {
                        grant.isFunded = true;
                        remainingPool -= fundingAmount;
                        fundedCount++;
                        
                        emit GrantFunded(grantId, grant.creator, fundingAmount);
                    }
                }
            }
        }
        
        // Start new funding round
        currentFundingRound++;
        totalGrantPool = 0;
        
        emit FundingRoundStarted(currentFundingRound, 0);
    }
    
    /**
     * @dev Add funds to the grant pool
     */
    function addToGrantPool(uint256 _amount) public {
        require(_amount > 0, "Amount must be positive");
        
        bool success = empowerToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");
        
        totalGrantPool += _amount;
    }
    
    /**
     * @dev Get grant details
     */
    function getGrant(uint256 _grantId) public view returns (Grant memory) {
        require(_grantId < grants.length, "Invalid grant ID");
        return grants[_grantId];
    }
    
    /**
     * @dev Get total grants count
     */
    function getGrantsCount() public view returns (uint256) {
        return grants.length;
    }
    
    /**
     * @dev Get user's vote for a specific grant
     */
    function getUserVote(uint256 _grantId, address _user) public view returns (Vote memory) {
        return votes[_grantId][_user];
    }
    
    /**
     * @dev Update voting period (only owner)
     */
    function setVotingPeriod(uint256 _newPeriod) public onlyOwner {
        votingPeriod = _newPeriod;
    }
    
    /**
     * @dev Update funding period (only owner)
     */
    function setFundingPeriod(uint256 _newPeriod) public onlyOwner {
        fundingPeriod = _newPeriod;
    }
}
