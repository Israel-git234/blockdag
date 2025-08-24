// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EmergencyAlert
 * @dev Emergency SOS system for women's safety
 * @dev Encrypted location sharing with verified helpers
 */
contract EmergencyAlert {
    struct Alert {
        address user;
        string encryptedLocation; // Encrypted with helper's public key
        string alertType; // "domestic_violence", "harassment", "medical", "general"
        uint256 timestamp;
        bool resolved;
        bool active;
        address[] responders;
        string notes;
    }

    struct Helper {
        address wallet;
        string name;
        string specialization; // "police", "medical", "counselor", "volunteer"
        string location; // General area they serve
        bool verified;
        bool available;
        uint256 responseCount;
        uint256 rating; // Average rating * 100 (to avoid decimals)
    }

    struct Response {
        uint256 alertId;
        address helper;
        uint256 timestamp;
        string status; // "acknowledged", "en_route", "arrived", "resolved"
        string notes;
    }

    mapping(uint256 => Alert) public alerts;
    mapping(address => Helper) public helpers;
    mapping(uint256 => Response[]) public alertResponses;
    mapping(address => uint256[]) public userAlerts;
    mapping(address => bool) public verifiedHelpers;
    
    uint256 public alertCount;
    uint256 public helperCount;
    address public admin;

    event AlertTriggered(
        uint256 indexed id, 
        address indexed user, 
        string alertType, 
        string encryptedLocation, 
        uint256 timestamp
    );
    event AlertResponded(uint256 indexed id, address indexed helper, string status);
    event AlertResolved(uint256 indexed id, address indexed user, uint256 timestamp);
    event HelperRegistered(address indexed helper, string name, string specialization);
    event HelperVerified(address indexed helper, address verifier);
    event EmergencyBroadcast(uint256 indexed alertId, string alertType, string location);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAlertUser(uint256 _alertId) {
        require(alerts[_alertId].user == msg.sender, "Only alert creator can perform this action");
        _;
    }

    modifier onlyVerifiedHelper() {
        require(verifiedHelpers[msg.sender], "Only verified helpers can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Trigger an emergency alert
     */
    function triggerAlert(
        string memory _encryptedLocation, 
        string memory _alertType,
        string memory _notes
    ) public {
        require(bytes(_encryptedLocation).length > 0, "Location cannot be empty");
        require(bytes(_alertType).length > 0, "Alert type cannot be empty");
        
        alertCount++;
        alerts[alertCount] = Alert({
            user: msg.sender,
            encryptedLocation: _encryptedLocation,
            alertType: _alertType,
            timestamp: block.timestamp,
            resolved: false,
            active: true,
            responders: new address[](0),
            notes: _notes
        });
        
        userAlerts[msg.sender].push(alertCount);
        
        emit AlertTriggered(alertCount, msg.sender, _alertType, _encryptedLocation, block.timestamp);
        emit EmergencyBroadcast(alertCount, _alertType, _encryptedLocation);
    }

    /**
     * @dev Register as a helper
     */
    function registerHelper(
        string memory _name, 
        string memory _specialization, 
        string memory _location
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(helpers[msg.sender].wallet == address(0), "Helper already registered");
        
        helpers[msg.sender] = Helper({
            wallet: msg.sender,
            name: _name,
            specialization: _specialization,
            location: _location,
            verified: false,
            available: true,
            responseCount: 0,
            rating: 500 // Default 5.0 rating * 100
        });
        
        helperCount++;
        emit HelperRegistered(msg.sender, _name, _specialization);
    }

    /**
     * @dev Verify a helper (only admin)
     */
    function verifyHelper(address _helper) public onlyAdmin {
        require(helpers[_helper].wallet != address(0), "Helper not registered");
        require(!helpers[_helper].verified, "Helper already verified");
        
        helpers[_helper].verified = true;
        verifiedHelpers[_helper] = true;
        
        emit HelperVerified(_helper, msg.sender);
    }

    /**
     * @dev Respond to an alert (only verified helpers)
     */
    function respondToAlert(
        uint256 _alertId, 
        string memory _status, 
        string memory _notes
    ) public onlyVerifiedHelper {
        require(_alertId > 0 && _alertId <= alertCount, "Invalid alert ID");
        require(alerts[_alertId].active && !alerts[_alertId].resolved, "Alert not active");
        require(helpers[msg.sender].available, "Helper not available");
        
        // Add responder to alert if not already added
        bool alreadyResponding = false;
        for (uint i = 0; i < alerts[_alertId].responders.length; i++) {
            if (alerts[_alertId].responders[i] == msg.sender) {
                alreadyResponding = true;
                break;
            }
        }
        
        if (!alreadyResponding) {
            alerts[_alertId].responders.push(msg.sender);
            helpers[msg.sender].responseCount++;
        }
        
        alertResponses[_alertId].push(Response({
            alertId: _alertId,
            helper: msg.sender,
            timestamp: block.timestamp,
            status: _status,
            notes: _notes
        }));
        
        emit AlertResponded(_alertId, msg.sender, _status);
    }

    /**
     * @dev Resolve an alert (only alert creator)
     */
    function resolveAlert(uint256 _alertId) public onlyAlertUser(_alertId) {
        require(!alerts[_alertId].resolved, "Alert already resolved");
        
        alerts[_alertId].resolved = true;
        alerts[_alertId].active = false;
        
        emit AlertResolved(_alertId, msg.sender, block.timestamp);
    }

    /**
     * @dev Cancel an alert (only alert creator)
     */
    function cancelAlert(uint256 _alertId) public onlyAlertUser(_alertId) {
        require(alerts[_alertId].active, "Alert not active");
        require(!alerts[_alertId].resolved, "Alert already resolved");
        
        alerts[_alertId].active = false;
    }

    /**
     * @dev Update helper availability
     */
    function setHelperAvailability(bool _available) public {
        require(helpers[msg.sender].wallet != address(0), "Helper not registered");
        helpers[msg.sender].available = _available;
    }

    /**
     * @dev Get active alerts in area (simplified)
     */
    function getActiveAlerts() public view returns (Alert[] memory) {
        Alert[] memory activeAlerts = new Alert[](alertCount);
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= alertCount; i++) {
            if (alerts[i].active && !alerts[i].resolved) {
                activeAlerts[activeCount] = alerts[i];
                activeCount++;
            }
        }
        
        // Resize array to actual count
        Alert[] memory result = new Alert[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeAlerts[i];
        }
        
        return result;
    }

    /**
     * @dev Get user's alert history
     */
    function getUserAlerts(address _user) public view returns (uint256[] memory) {
        return userAlerts[_user];
    }

    /**
     * @dev Get alert responses
     */
    function getAlertResponses(uint256 _alertId) public view returns (Response[] memory) {
        require(_alertId > 0 && _alertId <= alertCount, "Invalid alert ID");
        return alertResponses[_alertId];
    }

    /**
     * @dev Get verified helpers in area
     */
    function getVerifiedHelpers() public view returns (Helper[] memory) {
        Helper[] memory verifiedList = new Helper[](helperCount);
        uint256 verifiedCount = 0;
        
        // This is inefficient for large datasets - use off-chain indexing in production
        for (uint256 i = 0; i < helperCount; i++) {
            // Note: This is a simplified approach. In production, maintain a separate mapping
            // for efficiency when iterating through helpers
        }
        
        return verifiedList;
    }

    /**
     * @dev Get alert details
     */
    function getAlert(uint256 _alertId) public view returns (Alert memory) {
        require(_alertId > 0 && _alertId <= alertCount, "Invalid alert ID");
        return alerts[_alertId];
    }

    /**
     * @dev Get helper details
     */
    function getHelper(address _helper) public view returns (Helper memory) {
        require(helpers[_helper].wallet != address(0), "Helper not found");
        return helpers[_helper];
    }

    /**
     * @dev Rate a helper's response (only alert creator)
     */
    function rateHelper(uint256 _alertId, address _helper, uint8 _rating) public onlyAlertUser(_alertId) {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(alerts[_alertId].resolved, "Alert must be resolved first");
        
        // Check if helper responded to this alert
        bool helperResponded = false;
        for (uint i = 0; i < alerts[_alertId].responders.length; i++) {
            if (alerts[_alertId].responders[i] == _helper) {
                helperResponded = true;
                break;
            }
        }
        require(helperResponded, "Helper did not respond to this alert");
        
        // Update helper's average rating (simplified calculation)
        uint256 currentRating = helpers[_helper].rating;
        uint256 responseCount = helpers[_helper].responseCount;
        uint256 newRating = ((currentRating * (responseCount - 1)) + (_rating * 100)) / responseCount;
        helpers[_helper].rating = newRating;
    }
}
