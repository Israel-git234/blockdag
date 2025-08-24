// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AssistanceCenterRegistry
 * @dev Decentralized registry for women's assistance centers
 * @dev Verified centers provide safe spaces and support services
 */
contract AssistanceCenterRegistry {
    struct Center {
        string name;
        string location; // Geohash or coordinates, e.g., "37.7749,-122.4194"
        string country;
        string province;
        string community;
        string services; // Types of services offered
        string contactInfo; // Encrypted contact information
        address owner;
        bool verified;
        uint256 registrationDate;
        uint256 verificationDate;
    }

    struct Review {
        address reviewer;
        uint256 centerId;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        bool verified;
    }

    mapping(uint256 => Center) public centers;
    mapping(uint256 => Review[]) public centerReviews;
    mapping(address => bool) public verifiers;
    mapping(address => bool) public registeredCenters;
    
    uint256 public centerCount;
    uint256 public totalReviews;
    address public admin;

    event CenterRegistered(uint256 indexed id, string name, string location, address owner);
    event CenterVerified(uint256 indexed id, address verifier, uint256 timestamp);
    event ReviewAdded(uint256 indexed centerId, address reviewer, uint8 rating, uint256 timestamp);
    event VerifierAdded(address verifier);
    event EmergencyAlert(uint256 indexed centerId, address user, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender] || msg.sender == admin, "Only verifiers can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        verifiers[msg.sender] = true;
    }

    /**
     * @dev Register a new assistance center
     */
    function registerCenter(
        string memory _name, 
        string memory _location, 
        string memory _country, 
        string memory _province, 
        string memory _community,
        string memory _services,
        string memory _contactInfo
    ) public {
        require(!registeredCenters[msg.sender], "Center already registered by this address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");
        
        centerCount++;
        centers[centerCount] = Center({
            name: _name,
            location: _location,
            country: _country,
            province: _province,
            community: _community,
            services: _services,
            contactInfo: _contactInfo,
            owner: msg.sender,
            verified: false,
            registrationDate: block.timestamp,
            verificationDate: 0
        });
        
        registeredCenters[msg.sender] = true;
        emit CenterRegistered(centerCount, _name, _location, msg.sender);
    }

    /**
     * @dev Verify a center (only verifiers)
     */
    function verifyCenter(uint256 _id) public onlyVerifier {
        require(_id > 0 && _id <= centerCount, "Invalid center ID");
        require(!centers[_id].verified, "Center already verified");
        
        centers[_id].verified = true;
        centers[_id].verificationDate = block.timestamp;
        
        emit CenterVerified(_id, msg.sender, block.timestamp);
    }

    /**
     * @dev Add a verifier (only admin)
     */
    function addVerifier(address _verifier) public onlyAdmin {
        verifiers[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    /**
     * @dev Add a review for a center
     */
    function addReview(uint256 _centerId, uint8 _rating, string memory _comment) public {
        require(_centerId > 0 && _centerId <= centerCount, "Invalid center ID");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(centers[_centerId].verified, "Center must be verified");
        
        centerReviews[_centerId].push(Review({
            reviewer: msg.sender,
            centerId: _centerId,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp,
            verified: false
        }));
        
        totalReviews++;
        emit ReviewAdded(_centerId, msg.sender, _rating, block.timestamp);
    }

    /**
     * @dev Get nearby centers (simplified - use off-chain for complex geo queries)
     */
    function getNearbyCenters(string memory _userLocation) public view returns (Center[] memory) {
        // In production, implement geohash-based proximity search
        Center[] memory nearby = new Center[](centerCount);
        uint256 nearbyCount = 0;
        
        for (uint256 i = 1; i <= centerCount; i++) {
            if (centers[i].verified) {
                nearby[nearbyCount] = centers[i];
                nearbyCount++;
            }
        }
        
        // Resize array to actual count
        Center[] memory result = new Center[](nearbyCount);
        for (uint256 i = 0; i < nearbyCount; i++) {
            result[i] = nearby[i];
        }
        
        return result;
    }

    /**
     * @dev Get verified centers
     */
    function getVerifiedCenters() public view returns (Center[] memory) {
        Center[] memory verified = new Center[](centerCount);
        uint256 verifiedCount = 0;
        
        for (uint256 i = 1; i <= centerCount; i++) {
            if (centers[i].verified) {
                verified[verifiedCount] = centers[i];
                verifiedCount++;
            }
        }
        
        // Resize array to actual count
        Center[] memory result = new Center[](verifiedCount);
        for (uint256 i = 0; i < verifiedCount; i++) {
            result[i] = verified[i];
        }
        
        return result;
    }

    /**
     * @dev Get reviews for a center
     */
    function getCenterReviews(uint256 _centerId) public view returns (Review[] memory) {
        require(_centerId > 0 && _centerId <= centerCount, "Invalid center ID");
        return centerReviews[_centerId];
    }

    /**
     * @dev Get center details
     */
    function getCenter(uint256 _id) public view returns (Center memory) {
        require(_id > 0 && _id <= centerCount, "Invalid center ID");
        return centers[_id];
    }

    /**
     * @dev Emergency alert - log when someone contacts a center
     */
    function logEmergencyContact(uint256 _centerId) public {
        require(_centerId > 0 && _centerId <= centerCount, "Invalid center ID");
        require(centers[_centerId].verified, "Center must be verified");
        
        emit EmergencyAlert(_centerId, msg.sender, block.timestamp);
    }

    /**
     * @dev Update center information (only owner)
     */
    function updateCenter(
        uint256 _id,
        string memory _services,
        string memory _contactInfo
    ) public {
        require(_id > 0 && _id <= centerCount, "Invalid center ID");
        require(centers[_id].owner == msg.sender, "Only center owner can update");
        
        centers[_id].services = _services;
        centers[_id].contactInfo = _contactInfo;
    }
}
