// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EmpowerToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SponsorStream
 * @dev Continuous micro-streams and donations with stop/revoke functionality
 */
contract SponsorStream is ReentrancyGuard, Ownable {
    EmpowerToken public immutable empowerToken;
    
    struct Stream {
        address sponsor;
        address recipient;
        uint256 amountPerSecond;
        uint256 startTime;
        uint256 stopTime;
        uint256 totalStreamed;
        bool isActive;
        string description;
    }
    
    struct Donation {
        address donor;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        string message;
        bool isRevoked;
    }
    
    uint256 public streamCounter = 0;
    uint256 public donationCounter = 0;
    
    mapping(uint256 => Stream) public streams;
    mapping(uint256 => Donation) public donations;
    mapping(address => uint256[]) public userStreams; // user => stream IDs
    mapping(address => uint256[]) public userDonations; // user => donation IDs
    mapping(address => uint256) public userTotalReceived; // user => total received
    
    event StreamCreated(uint256 indexed streamId, address indexed sponsor, address indexed recipient, uint256 amountPerSecond);
    event StreamStopped(uint256 indexed streamId, address indexed sponsor);
    event StreamWithdrawn(uint256 indexed streamId, address indexed recipient, uint256 amount);
    event DonationMade(uint256 indexed donationId, address indexed donor, address indexed recipient, uint256 amount);
    event DonationRevoked(uint256 indexed donationId, address indexed donor);
    
    constructor(address _empowerTokenAddress) Ownable(msg.sender) {
        empowerToken = EmpowerToken(_empowerTokenAddress);
    }
    
    /**
     * @dev Create a new stream
     */
    function createStream(
        address _recipient,
        uint256 _amountPerSecond,
        uint256 _duration,
        string memory _description
    ) public {
        require(_recipient != address(0), "Invalid recipient");
        require(_amountPerSecond > 0, "Amount per second must be positive");
        require(_duration > 0, "Duration must be positive");
        
        uint256 totalAmount = _amountPerSecond * _duration;
        
        // Transfer tokens to contract
        bool success = empowerToken.transferFrom(msg.sender, address(this), totalAmount);
        require(success, "Token transfer failed");
        
        uint256 streamId = streamCounter++;
        streams[streamId] = Stream({
            sponsor: msg.sender,
            recipient: _recipient,
            amountPerSecond: _amountPerSecond,
            startTime: block.timestamp,
            stopTime: block.timestamp + _duration,
            totalStreamed: 0,
            isActive: true,
            description: _description
        });
        
        userStreams[msg.sender].push(streamId);
        userStreams[_recipient].push(streamId);
        
        emit StreamCreated(streamId, msg.sender, _recipient, _amountPerSecond);
    }
    
    /**
     * @dev Stop a stream early (only sponsor)
     */
    function stopStream(uint256 _streamId) public {
        require(_streamId < streamCounter, "Invalid stream ID");
        Stream storage stream = streams[_streamId];
        require(msg.sender == stream.sponsor, "Only sponsor can stop");
        require(stream.isActive, "Stream already stopped");
        
        stream.isActive = false;
        stream.stopTime = block.timestamp;
        
        emit StreamStopped(_streamId, msg.sender);
    }
    
    /**
     * @dev Withdraw accumulated stream amount (only recipient)
     */
    function withdrawStream(uint256 _streamId) public nonReentrant {
        require(_streamId < streamCounter, "Invalid stream ID");
        Stream storage stream = streams[_streamId];
        require(msg.sender == stream.recipient, "Only recipient can withdraw");
        require(stream.isActive || block.timestamp >= stream.stopTime, "Stream still active");
        
        uint256 withdrawableAmount = getWithdrawableAmount(_streamId);
        require(withdrawableAmount > 0, "Nothing to withdraw");
        
        stream.totalStreamed += withdrawableAmount;
        userTotalReceived[stream.recipient] += withdrawableAmount;
        
        // Transfer tokens to recipient
        bool success = empowerToken.transfer(stream.recipient, withdrawableAmount);
        require(success, "Transfer failed");
        
        emit StreamWithdrawn(_streamId, stream.recipient, withdrawableAmount);
    }
    
    /**
     * @dev Make a one-time donation
     */
    function makeDonation(
        address _recipient,
        uint256 _amount,
        string memory _message
    ) public {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be positive");
        
        // Transfer tokens to contract
        bool success = empowerToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");
        
        uint256 donationId = donationCounter++;
        donations[donationId] = Donation({
            donor: msg.sender,
            recipient: _recipient,
            amount: _amount,
            timestamp: block.timestamp,
            message: _message,
            isRevoked: false
        });
        
        userDonations[msg.sender].push(donationId);
        userDonations[_recipient].push(donationId);
        userTotalReceived[_recipient] += _amount;
        
        emit DonationMade(donationId, msg.sender, _recipient, _amount);
    }
    
    /**
     * @dev Revoke a donation (only donor, within 24 hours)
     */
    function revokeDonation(uint256 _donationId) public nonReentrant {
        require(_donationId < donationCounter, "Invalid donation ID");
        Donation storage donation = donations[_donationId];
        require(msg.sender == donation.donor, "Only donor can revoke");
        require(!donation.isRevoked, "Already revoked");
        require(block.timestamp < donation.timestamp + 24 hours, "24 hour window expired");
        
        donation.isRevoked = true;
        userTotalReceived[donation.recipient] -= donation.amount;
        
        // Refund tokens to donor
        bool success = empowerToken.transfer(donation.donor, donation.amount);
        require(success, "Refund failed");
        
        emit DonationRevoked(_donationId, msg.sender);
    }
    
    /**
     * @dev Get withdrawable amount for a stream
     */
    function getWithdrawableAmount(uint256 _streamId) public view returns (uint256) {
        require(_streamId < streamCounter, "Invalid stream ID");
        Stream storage stream = streams[_streamId];
        
        if (!stream.isActive && block.timestamp >= stream.stopTime) {
            // Stream ended, calculate total amount
            uint256 totalDuration = stream.stopTime - stream.startTime;
            uint256 totalAmount = stream.amountPerSecond * totalDuration;
            return totalAmount - stream.totalStreamed;
        } else if (stream.isActive) {
            // Stream active, calculate current amount
            uint256 elapsed = block.timestamp - stream.startTime;
            uint256 currentAmount = stream.amountPerSecond * elapsed;
            return currentAmount - stream.totalStreamed;
        }
        
        return 0;
    }
    
    /**
     * @dev Get stream details
     */
    function getStream(uint256 _streamId) public view returns (Stream memory) {
        require(_streamId < streamCounter, "Invalid stream ID");
        return streams[_streamId];
    }
    
    /**
     * @dev Get donation details
     */
    function getDonation(uint256 _donationId) public view returns (Donation memory) {
        require(_donationId < donationCounter, "Invalid donation ID");
        return donations[_donationId];
    }
    
    /**
     * @dev Get user's streams
     */
    function getUserStreams(address _user) public view returns (uint256[] memory) {
        return userStreams[_user];
    }
    
    /**
     * @dev Get user's donations
     */
    function getUserDonations(address _user) public view returns (uint256[] memory) {
        return userDonations[_user];
    }
    
    /**
     * @dev Get total received by user
     */
    function getUserTotalReceived(address _user) public view returns (uint256) {
        return userTotalReceived[_user];
    }
    
    /**
     * @dev Get total streams count
     */
    function getStreamsCount() public view returns (uint256) {
        return streamCounter;
    }
    
    /**
     * @dev Get total donations count
     */
    function getDonationsCount() public view returns (uint256) {
        return donationCounter;
    }
}
