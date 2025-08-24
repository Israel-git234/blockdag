// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EmpoweToken.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title JobBounty
 * @dev Escrowed job payments with milestone verification
 */
contract JobBounty is ReentrancyGuard, Ownable {
    EmpowerToken public immutable empowerToken;
    
    struct Job {
        address employer;
        string title;
        string description;
        uint256 totalBounty;
        uint256 deadline;
        bool isActive;
        bool isCompleted;
        address assignedWorker;
        uint256 completionDate;
    }
    
    struct Milestone {
        string description;
        uint256 amount;
        bool isCompleted;
        bool isVerified;
        address worker;
        uint256 completionDate;
    }
    
    uint256 public jobCounter = 0;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Milestone[]) public jobMilestones; // jobId => milestones
    mapping(uint256 => mapping(address => bool)) public jobApplications; // jobId => worker => applied
    
    event JobCreated(uint256 indexed jobId, address indexed employer, string title, uint256 bounty);
    event JobApplied(uint256 indexed jobId, address indexed worker);
    event JobAssigned(uint256 indexed jobId, address indexed worker);
    event MilestoneCompleted(uint256 indexed jobId, uint256 indexed milestoneId, address indexed worker);
    event MilestoneVerified(uint256 indexed jobId, uint256 indexed milestoneId, address indexed worker);
    event JobCompleted(uint256 indexed jobId, address indexed worker, uint256 totalPaid);
    
    constructor(address _empowerTokenAddress) Ownable(msg.sender) {
        empowerToken = EmpowerToken(_empowerTokenAddress);
    }
    
    /**
     * @dev Create a new job with milestones
     */
    function createJob(
        string memory _title,
        string memory _description,
        uint256 _totalBounty,
        uint256 _deadline,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts
    ) public {
        require(_totalBounty > 0, "Bounty must be positive");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Milestone arrays must match");
        require(_milestoneDescriptions.length > 0, "Must have at least one milestone");
        
        uint256 totalMilestoneAmount = 0;
        for (uint i = 0; i < _milestoneAmounts.length; i++) {
            totalMilestoneAmount += _milestoneAmounts[i];
        }
        require(totalMilestoneAmount == _totalBounty, "Milestone amounts must equal total bounty");
        
        // Transfer bounty to contract
        bool success = empowerToken.transferFrom(msg.sender, address(this), _totalBounty);
        require(success, "Token transfer failed");
        
        uint256 jobId = jobCounter++;
        jobs[jobId] = Job({
            employer: msg.sender,
            title: _title,
            description: _description,
            totalBounty: _totalBounty,
            deadline: _deadline,
            isActive: true,
            isCompleted: false,
            assignedWorker: address(0),
            completionDate: 0
        });
        
        // Create milestones
        Milestone[] storage milestones = jobMilestones[jobId];
        for (uint i = 0; i < _milestoneDescriptions.length; i++) {
            milestones.push(Milestone({
                description: _milestoneDescriptions[i],
                amount: _milestoneAmounts[i],
                isCompleted: false,
                isVerified: false,
                worker: address(0),
                completionDate: 0
            }));
        }
        
        emit JobCreated(jobId, msg.sender, _title, _totalBounty);
    }
    
    /**
     * @dev Apply for a job
     */
    function applyForJob(uint256 _jobId) public {
        require(_jobId < jobCounter, "Invalid job ID");
        Job storage job = jobs[_jobId];
        require(job.isActive, "Job is not active");
        require(job.assignedWorker == address(0), "Job already assigned");
        require(!jobApplications[_jobId][msg.sender], "Already applied");
        
        jobApplications[_jobId][msg.sender] = true;
        emit JobApplied(_jobId, msg.sender);
    }
    
    /**
     * @dev Assign job to a worker (only employer)
     */
    function assignJob(uint256 _jobId, address _worker) public {
        require(_jobId < jobCounter, "Invalid job ID");
        Job storage job = jobs[_jobId];
        require(msg.sender == job.employer, "Only employer can assign");
        require(job.isActive, "Job is not active");
        require(job.assignedWorker == address(0), "Job already assigned");
        require(jobApplications[_jobId][_worker], "Worker must apply first");
        
        job.assignedWorker = _worker;
        emit JobAssigned(_jobId, _worker);
    }
    
    /**
     * @dev Complete a milestone (only assigned worker)
     */
    function completeMilestone(uint256 _jobId, uint256 _milestoneId) public {
        require(_jobId < jobCounter, "Invalid job ID");
        Job storage job = jobs[_jobId];
        require(msg.sender == job.assignedWorker, "Only assigned worker can complete");
        require(job.isActive, "Job is not active");
        
        Milestone[] storage milestones = jobMilestones[_jobId];
        require(_milestoneId < milestones.length, "Invalid milestone ID");
        Milestone storage milestone = milestones[_milestoneId];
        require(!milestone.isCompleted, "Milestone already completed");
        
        milestone.isCompleted = true;
        milestone.worker = msg.sender;
        milestone.completionDate = block.timestamp;
        
        emit MilestoneCompleted(_jobId, _milestoneId, msg.sender);
    }
    
    /**
     * @dev Verify and pay for completed milestone (only employer)
     */
    function verifyMilestone(uint256 _jobId, uint256 _milestoneId) public nonReentrant {
        require(_jobId < jobCounter, "Invalid job ID");
        Job storage job = jobs[_jobId];
        require(msg.sender == job.employer, "Only employer can verify");
        require(job.isActive, "Job is not active");
        
        Milestone[] storage milestones = jobMilestones[_jobId];
        require(_milestoneId < milestones.length, "Invalid milestone ID");
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.isCompleted, "Milestone not completed");
        require(!milestone.isVerified, "Milestone already verified");
        
        milestone.isVerified = true;
        
        // Pay the worker
        bool success = empowerToken.transfer(milestone.worker, milestone.amount);
        require(success, "Payment failed");
        
        emit MilestoneVerified(_jobId, _milestoneId, milestone.worker);
        
        // Check if all milestones are completed
        bool allCompleted = true;
        for (uint i = 0; i < milestones.length; i++) {
            if (!milestones[i].isVerified) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted) {
            job.isCompleted = true;
            job.completionDate = block.timestamp;
            job.isActive = false;
            emit JobCompleted(_jobId, job.assignedWorker, job.totalBounty);
        }
    }
    
    /**
     * @dev Cancel job and refund bounty (only employer, before assignment)
     */
    function cancelJob(uint256 _jobId) public nonReentrant {
        require(_jobId < jobCounter, "Invalid job ID");
        Job storage job = jobs[_jobId];
        require(msg.sender == job.employer, "Only employer can cancel");
        require(job.isActive, "Job is not active");
        require(job.assignedWorker == address(0), "Cannot cancel assigned job");
        
        job.isActive = false;
        
        // Refund bounty
        bool success = empowerToken.transfer(job.employer, job.totalBounty);
        require(success, "Refund failed");
    }
    
    /**
     * @dev Get job details
     */
    function getJob(uint256 _jobId) public view returns (Job memory) {
        require(_jobId < jobCounter, "Invalid job ID");
        return jobs[_jobId];
    }
    
    /**
     * @dev Get job milestones
     */
    function getJobMilestones(uint256 _jobId) public view returns (Milestone[] memory) {
        require(_jobId < jobCounter, "Invalid job ID");
        return jobMilestones[_jobId];
    }
    
    /**
     * @dev Get total jobs count
     */
    function getJobsCount() public view returns (uint256) {
        return jobCounter;
    }
    
    /**
     * @dev Check if user has applied for a job
     */
    function hasApplied(uint256 _jobId, address _worker) public view returns (bool) {
        return jobApplications[_jobId][_worker];
    }
}
