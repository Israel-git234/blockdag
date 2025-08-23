// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EmpowerToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Stokvel
 * @dev Manages decentralized savings circles (Stokvels) using EmpowerToken (EMW).
 */
contract Stokvel is ReentrancyGuard {
    EmpowerToken public immutable empowerToken;

    struct Circle {
        string name;
        string description;
        uint256 contributionAmount;
        uint256 maxMembers;
        address[] members;
        mapping(address => uint256) contributions;
        uint256 totalBalance;
        bool isActive;
        address creator;
    }

    Circle[] public circles;

    event CircleCreated(uint256 indexed circleId, address indexed creator, string name, uint256 contributionAmount, uint256 maxMembers);
    event MemberJoined(uint256 indexed circleId, address indexed newMember);
    event ContributionMade(uint256 indexed circleId, address indexed member, uint256 amount);

    constructor(address _empowerTokenAddress) {
        empowerToken = EmpowerToken(_empowerTokenAddress);
    }

    /**
     * @dev Creates a new savings circle.
     * @param _name The name of the circle.
     * @param _description A short description.
     * @param _contributionAmount The required contribution amount per member.
     * @param _maxMembers The maximum number of members allowed.
     */
    function createCircle(string memory _name, string memory _description, uint256 _contributionAmount, uint256 _maxMembers) public {
        require(_contributionAmount > 0, "Contribution must be positive");
        require(_maxMembers > 1, "Must have at least 2 members");

        Circle storage newCircle = circles.push();
        newCircle.name = _name;
        newCircle.description = _description;
        newCircle.contributionAmount = _contributionAmount;
        newCircle.maxMembers = _maxMembers;
        newCircle.isActive = true;
        newCircle.creator = msg.sender;
        
        // The creator automatically becomes the first member
        newCircle.members.push(msg.sender);

        emit CircleCreated(circles.length - 1, msg.sender, _name, _contributionAmount, _maxMembers);
        emit MemberJoined(circles.length - 1, msg.sender);
    }

    /**
     * @dev Allows a user to join an existing, active circle.
     * @param _circleId The ID of the circle to join.
     */
    function joinCircle(uint256 _circleId) public {
        Circle storage circle = circles[_circleId];
        require(circle.isActive, "Circle is not active");
        require(circle.members.length < circle.maxMembers, "Circle is full");

        // Check if the user is already a member
        for (uint i = 0; i < circle.members.length; i++) {
            require(circle.members[i] != msg.sender, "Already a member");
        }

        circle.members.push(msg.sender);
        emit MemberJoined(_circleId, msg.sender);
    }

    /**
     * @dev Allows a member to make their contribution to the circle.
     * @param _circleId The ID of the circle to contribute to.
     */
    function contribute(uint256 _circleId) public nonReentrant {
        Circle storage circle = circles[_circleId];
        require(circle.isActive, "Circle is not active");

        // For simplicity in the hackathon, we'll just check if they are a member.
        // A full implementation would track contribution rounds.
        bool isMember = false;
        for (uint i = 0; i < circle.members.length; i++) {
            if (circle.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Not a member of this circle");

        uint256 amount = circle.contributionAmount;
        
        // Transfer tokens from the member to this contract
        bool success = empowerToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");

        circle.contributions[msg.sender] += amount;
        circle.totalBalance += amount;

        emit ContributionMade(_circleId, msg.sender, amount);
    }
    
    function getCirclesCount() public view returns (uint256) {
        return circles.length;
    }

    function getCircleMembers(uint256 _circleId) public view returns (address[] memory) {
        return circles[_circleId].members;
    }
}
