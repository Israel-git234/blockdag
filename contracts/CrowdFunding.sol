// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EmpowerToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CrowdFunding
 * @dev This contract manages the creation and funding of campaigns on the EmpowerHer platform.
 * It interacts with the EmpowerToken (EMW) for donations.
 */
contract CrowdFunding is ReentrancyGuard {
    // Reference to the EmpowerToken contract
    EmpowerToken public immutable empowerToken;

    // Struct to hold all the information about a single campaign
    struct Campaign {
        address creator;      // The address of the person who created the campaign
        string title;         // The title of the campaign
        string description;   // A description of the campaign's purpose
        uint256 goal;         // The funding goal in EMW tokens (with decimals)
        uint256 deadline;     // The timestamp when the campaign ends
        uint256 totalDonations; // The total amount of EMW tokens raised
        bool claimed;         // Whether the creator has claimed the funds
    }

    // Array to store all campaigns
    Campaign[] public campaigns;

    // Mapping to track how much each address has donated to a specific campaign
    mapping(uint256 => mapping(address => uint256)) public donations;

    // Event to be emitted when a new campaign is created
    event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 goal, uint256 deadline);
    
    // Event to be emitted when a donation is made
    event Donated(uint256 indexed campaignId, address indexed donor, uint256 amount);
    
    // Event to be emitted when funds are claimed by the creator
    event FundsClaimed(uint256 indexed campaignId, address indexed creator, uint256 amount);

    // Event to be emitted when a donor gets a refund
    event Refunded(uint256 indexed campaignId, address indexed donor, uint256 amount);

    /**
     * @dev Constructor: Sets the address of the EmpowerToken contract.
     * @param _empowerTokenAddress The address of the deployed EMW token contract.
     */
    constructor(address _empowerTokenAddress) {
        empowerToken = EmpowerToken(_empowerTokenAddress);
    }

    /**
     * @dev Allows a user to create a new fundraising campaign.
     * @param _title The title for the new campaign.
     * @param _description A detailed description of the campaign.
     * @param _goal The funding goal in the smallest unit of EMW tokens.
     * @param _duration The duration of the campaign in seconds.
     */
    function createCampaign(string memory _title, string memory _description, uint256 _goal, uint256 _duration) public {
        require(_goal > 0, "Goal must be greater than zero");
        require(_duration > 0, "Duration must be greater than zero");

        uint256 campaignId = campaigns.length;
        campaigns.push(Campaign({
            creator: msg.sender,
            title: _title,
            description: _description,
            goal: _goal,
            deadline: block.timestamp + _duration,
            totalDonations: 0,
            claimed: false
        }));

        emit CampaignCreated(campaignId, msg.sender, _title, _goal, block.timestamp + _duration);
    }

    /**
     * @dev Allows a user to donate EMW tokens to a specific campaign.
     * The user must first approve this contract to spend their tokens.
     * @param _campaignId The ID of the campaign to donate to.
     * @param _amount The amount of EMW tokens to donate.
     */
    function donate(uint256 _campaignId, uint256 _amount) public nonReentrant {
        require(_campaignId < campaigns.length, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(_amount > 0, "Donation amount must be positive");

        // Transfer tokens from the donor to this contract
        bool success = empowerToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");

        // Update campaign and donor records
        campaign.totalDonations += _amount;
        donations[_campaignId][msg.sender] += _amount;

        emit Donated(_campaignId, msg.sender, _amount);
    }

    /**
     * @dev Allows the campaign creator to claim the funds if the goal was met.
     * Can only be called after the campaign deadline has passed.
     * @param _campaignId The ID of the campaign to claim funds from.
     */
    function claimFunds(uint256 _campaignId) public nonReentrant {
        require(_campaignId < campaigns.length, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        
        require(msg.sender == campaign.creator, "Only the creator can claim funds");
        require(block.timestamp >= campaign.deadline, "Campaign has not ended yet");
        require(campaign.totalDonations >= campaign.goal, "Campaign goal not reached");
        require(!campaign.claimed, "Funds already claimed");

        campaign.claimed = true;
        uint256 amountToClaim = campaign.totalDonations;

        // Transfer the collected tokens to the creator
        bool success = empowerToken.transfer(campaign.creator, amountToClaim);
        require(success, "Token transfer failed");

        emit FundsClaimed(_campaignId, campaign.creator, amountToClaim);
    }

    /**
     * @dev Allows a donor to get a refund if the campaign failed to meet its goal.
     * Can only be called after the campaign deadline has passed.
     * @param _campaignId The ID of the campaign to get a refund from.
     */
    function getRefund(uint256 _campaignId) public nonReentrant {
        require(_campaignId < campaigns.length, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];

        require(block.timestamp >= campaign.deadline, "Campaign has not ended yet");
        require(campaign.totalDonations < campaign.goal, "Campaign goal was reached");
        
        uint256 refundAmount = donations[_campaignId][msg.sender];
        require(refundAmount > 0, "You did not donate to this campaign");

        // Reset the donor's contribution amount to prevent multiple refunds
        donations[_campaignId][msg.sender] = 0;

        // Transfer the tokens back to the donor
        bool success = empowerToken.transfer(msg.sender, refundAmount);
        require(success, "Token transfer failed");

        emit Refunded(_campaignId, msg.sender, refundAmount);
    }

    /**
     * @dev A helper function to get the number of campaigns.
     * @return The total number of campaigns created.
     */
    function getCampaignsCount() public view returns (uint256) {
        return campaigns.length;
    }
}
