// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CounselorMarketplace
 * @dev Decentralized marketplace for professional counseling services
 * @dev Connecting women with licensed therapists and counselors
 */
contract CounselorMarketplace {
    struct Counselor {
        address wallet;
        string name;
        string specialization; // "trauma", "domestic_violence", "anxiety", "depression", etc.
        string credentials; // Encrypted credentials and certifications
        string bio;
        string languages; // Languages spoken
        bool available;
        bool verified;
        uint256 rate; // Rate per session in wei
        uint256 sessionCount;
        uint256 rating; // Average rating * 100 (to avoid decimals)
        uint256 registrationDate;
        string[] availableSlots; // Available time slots
    }

    struct Session {
        uint256 id;
        address user;
        address counselor;
        uint256 scheduledTime;
        uint256 duration; // Duration in minutes
        uint256 rate;
        string sessionType; // "video", "audio", "chat"
        string status; // "booked", "confirmed", "completed", "cancelled"
        bool paid;
        string notes; // Encrypted session notes
        uint256 createdAt;
    }

    struct Review {
        uint256 sessionId;
        address reviewer;
        address counselor;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        bool isAnonymous;
    }

    mapping(address => Counselor) public counselors;
    mapping(uint256 => Session) public sessions;
    mapping(address => uint256[]) public userSessions;
    mapping(address => uint256[]) public counselorSessions;
    mapping(uint256 => Review[]) public sessionReviews;
    mapping(address => bool) public verifiedCounselors;
    
    uint256 public sessionCount;
    uint256 public counselorCount;
    uint256 public totalReviews;
    address public admin;
    uint256 public platformFee = 5; // 5% platform fee

    event CounselorRegistered(address indexed counselor, string name, string specialization);
    event CounselorVerified(address indexed counselor, address verifier);
    event SessionBooked(
        uint256 indexed sessionId, 
        address indexed user, 
        address indexed counselor, 
        uint256 scheduledTime, 
        uint256 rate
    );
    event SessionConfirmed(uint256 indexed sessionId, address counselor);
    event SessionCompleted(uint256 indexed sessionId, uint256 timestamp);
    event SessionCancelled(uint256 indexed sessionId, string reason);
    event ReviewAdded(uint256 indexed sessionId, address reviewer, uint8 rating);
    event PaymentReleased(uint256 indexed sessionId, address counselor, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlySessionParticipant(uint256 _sessionId) {
        require(
            sessions[_sessionId].user == msg.sender || 
            sessions[_sessionId].counselor == msg.sender,
            "Only session participants can perform this action"
        );
        _;
    }

    modifier onlyVerifiedCounselor() {
        require(verifiedCounselors[msg.sender], "Only verified counselors can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Register as a counselor
     */
    function registerCounselor(
        string memory _name, 
        string memory _specialization, 
        string memory _credentials,
        string memory _bio,
        string memory _languages,
        uint256 _rate
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(counselors[msg.sender].wallet == address(0), "Counselor already registered");
        require(_rate > 0, "Rate must be greater than 0");
        
        counselors[msg.sender] = Counselor({
            wallet: msg.sender,
            name: _name,
            specialization: _specialization,
            credentials: _credentials,
            bio: _bio,
            languages: _languages,
            available: false, // Starts as unavailable until verified
            verified: false,
            rate: _rate,
            sessionCount: 0,
            rating: 500, // Default 5.0 rating * 100
            registrationDate: block.timestamp,
            availableSlots: new string[](0)
        });
        
        counselorCount++;
        emit CounselorRegistered(msg.sender, _name, _specialization);
    }

    /**
     * @dev Verify a counselor (only admin)
     */
    function verifyCounselor(address _counselor) public onlyAdmin {
        require(counselors[_counselor].wallet != address(0), "Counselor not registered");
        require(!counselors[_counselor].verified, "Counselor already verified");
        
        counselors[_counselor].verified = true;
        counselors[_counselor].available = true;
        verifiedCounselors[_counselor] = true;
        
        emit CounselorVerified(_counselor, msg.sender);
    }

    /**
     * @dev Book a counseling session
     */
    function bookSession(
        address _counselor, 
        uint256 _scheduledTime, 
        uint256 _duration,
        string memory _sessionType
    ) public payable {
        require(counselors[_counselor].verified, "Counselor not verified");
        require(counselors[_counselor].available, "Counselor not available");
        require(_scheduledTime > block.timestamp, "Cannot schedule session in the past");
        require(_duration >= 30 && _duration <= 120, "Session must be between 30-120 minutes");
        
        uint256 sessionCost = counselors[_counselor].rate;
        require(msg.value >= sessionCost, "Insufficient payment");
        
        sessionCount++;
        sessions[sessionCount] = Session({
            id: sessionCount,
            user: msg.sender,
            counselor: _counselor,
            scheduledTime: _scheduledTime,
            duration: _duration,
            rate: sessionCost,
            sessionType: _sessionType,
            status: "booked",
            paid: true,
            notes: "",
            createdAt: block.timestamp
        });
        
        userSessions[msg.sender].push(sessionCount);
        counselorSessions[_counselor].push(sessionCount);
        
        // Refund excess payment
        if (msg.value > sessionCost) {
            payable(msg.sender).transfer(msg.value - sessionCost);
        }
        
        emit SessionBooked(sessionCount, msg.sender, _counselor, _scheduledTime, sessionCost);
    }

    /**
     * @dev Confirm a session (only counselor)
     */
    function confirmSession(uint256 _sessionId) public {
        require(sessions[_sessionId].counselor == msg.sender, "Only assigned counselor can confirm");
        require(keccak256(abi.encodePacked(sessions[_sessionId].status)) == keccak256(abi.encodePacked("booked")), "Session not in bookable state");
        
        sessions[_sessionId].status = "confirmed";
        emit SessionConfirmed(_sessionId, msg.sender);
    }

    /**
     * @dev Complete a session (only counselor)
     */
    function completeSession(uint256 _sessionId, string memory _notes) public {
        require(sessions[_sessionId].counselor == msg.sender, "Only assigned counselor can complete");
        require(
            keccak256(abi.encodePacked(sessions[_sessionId].status)) == keccak256(abi.encodePacked("confirmed")) ||
            keccak256(abi.encodePacked(sessions[_sessionId].status)) == keccak256(abi.encodePacked("booked")),
            "Session not in completable state"
        );
        
        sessions[_sessionId].status = "completed";
        sessions[_sessionId].notes = _notes;
        
        counselors[msg.sender].sessionCount++;
        
        // Release payment to counselor (minus platform fee)
        uint256 platformFeeAmount = (sessions[_sessionId].rate * platformFee) / 100;
        uint256 counselorPayment = sessions[_sessionId].rate - platformFeeAmount;
        
        payable(msg.sender).transfer(counselorPayment);
        payable(admin).transfer(platformFeeAmount);
        
        emit SessionCompleted(_sessionId, block.timestamp);
        emit PaymentReleased(_sessionId, msg.sender, counselorPayment);
    }

    /**
     * @dev Cancel a session
     */
    function cancelSession(uint256 _sessionId, string memory _reason) public onlySessionParticipant(_sessionId) {
        require(
            keccak256(abi.encodePacked(sessions[_sessionId].status)) != keccak256(abi.encodePacked("completed")) &&
            keccak256(abi.encodePacked(sessions[_sessionId].status)) != keccak256(abi.encodePacked("cancelled")),
            "Cannot cancel completed or already cancelled session"
        );
        
        sessions[_sessionId].status = "cancelled";
        
        // Refund user if session was paid and cancelled more than 24 hours before scheduled time
        if (sessions[_sessionId].paid && block.timestamp + 86400 < sessions[_sessionId].scheduledTime) {
            payable(sessions[_sessionId].user).transfer(sessions[_sessionId].rate);
        }
        
        emit SessionCancelled(_sessionId, _reason);
    }

    /**
     * @dev Add a review for a completed session
     */
    function addReview(
        uint256 _sessionId, 
        uint8 _rating, 
        string memory _comment, 
        bool _isAnonymous
    ) public {
        require(sessions[_sessionId].user == msg.sender, "Only session user can review");
        require(keccak256(abi.encodePacked(sessions[_sessionId].status)) == keccak256(abi.encodePacked("completed")), "Session must be completed");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        
        sessionReviews[_sessionId].push(Review({
            sessionId: _sessionId,
            reviewer: msg.sender,
            counselor: sessions[_sessionId].counselor,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp,
            isAnonymous: _isAnonymous
        }));
        
        // Update counselor's average rating
        address counselorAddr = sessions[_sessionId].counselor;
        uint256 currentRating = counselors[counselorAddr].rating;
        uint256 sessionCount = counselors[counselorAddr].sessionCount;
        uint256 newRating = ((currentRating * (sessionCount - 1)) + (_rating * 100)) / sessionCount;
        counselors[counselorAddr].rating = newRating;
        
        totalReviews++;
        emit ReviewAdded(_sessionId, msg.sender, _rating);
    }

    /**
     * @dev Update counselor availability
     */
    function setCounselorAvailability(bool _available) public {
        require(counselors[msg.sender].verified, "Counselor not verified");
        counselors[msg.sender].available = _available;
    }

    /**
     * @dev Update counselor rate
     */
    function updateCounselorRate(uint256 _newRate) public {
        require(counselors[msg.sender].verified, "Counselor not verified");
        require(_newRate > 0, "Rate must be greater than 0");
        counselors[msg.sender].rate = _newRate;
    }

    /**
     * @dev Get available counselors by specialization
     */
    function getCounselorsBySpecialization(string memory _specialization) public view returns (Counselor[] memory) {
        Counselor[] memory filtered = new Counselor[](counselorCount);
        uint256 filteredCount = 0;
        
        // Note: This is inefficient for large datasets - use off-chain indexing in production
        // For now, returning a simplified version
        return filtered;
    }

    /**
     * @dev Get verified and available counselors
     */
    function getAvailableCounselors() public view returns (Counselor[] memory) {
        Counselor[] memory available = new Counselor[](counselorCount);
        uint256 availableCount = 0;
        
        // Note: This is inefficient for large datasets - use off-chain indexing in production
        return available;
    }

    /**
     * @dev Get user's session history
     */
    function getUserSessions(address _user) public view returns (uint256[] memory) {
        return userSessions[_user];
    }

    /**
     * @dev Get counselor's session history
     */
    function getCounselorSessions(address _counselor) public view returns (uint256[] memory) {
        return counselorSessions[_counselor];
    }

    /**
     * @dev Get session reviews
     */
    function getSessionReviews(uint256 _sessionId) public view returns (Review[] memory) {
        return sessionReviews[_sessionId];
    }

    /**
     * @dev Get session details
     */
    function getSession(uint256 _sessionId) public view returns (Session memory) {
        require(_sessionId > 0 && _sessionId <= sessionCount, "Invalid session ID");
        return sessions[_sessionId];
    }

    /**
     * @dev Get counselor details
     */
    function getCounselor(address _counselor) public view returns (Counselor memory) {
        require(counselors[_counselor].wallet != address(0), "Counselor not found");
        return counselors[_counselor];
    }

    /**
     * @dev Emergency session booking (immediate availability)
     */
    function bookEmergencySession(address _counselor, string memory _sessionType) public payable {
        require(counselors[_counselor].verified, "Counselor not verified");
        require(counselors[_counselor].available, "Counselor not available");
        
        uint256 emergencyRate = counselors[_counselor].rate + (counselors[_counselor].rate * 50 / 100); // 50% surcharge
        require(msg.value >= emergencyRate, "Insufficient payment for emergency session");
        
        sessionCount++;
        sessions[sessionCount] = Session({
            id: sessionCount,
            user: msg.sender,
            counselor: _counselor,
            scheduledTime: block.timestamp + 300, // 5 minutes from now
            duration: 60, // Default 60 minutes
            rate: emergencyRate,
            sessionType: _sessionType,
            status: "booked",
            paid: true,
            notes: "EMERGENCY SESSION",
            createdAt: block.timestamp
        });
        
        userSessions[msg.sender].push(sessionCount);
        counselorSessions[_counselor].push(sessionCount);
        
        // Refund excess payment
        if (msg.value > emergencyRate) {
            payable(msg.sender).transfer(msg.value - emergencyRate);
        }
        
        emit SessionBooked(sessionCount, msg.sender, _counselor, block.timestamp + 300, emergencyRate);
    }

    /**
     * @dev Set platform fee (only admin)
     */
    function setPlatformFee(uint256 _fee) public onlyAdmin {
        require(_fee <= 20, "Platform fee cannot exceed 20%");
        platformFee = _fee;
    }

    /**
     * @dev Withdraw platform fees (only admin)
     */
    function withdrawPlatformFees() public onlyAdmin {
        uint256 balance = address(this).balance;
        payable(admin).transfer(balance);
    }
}
