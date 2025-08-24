// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title WomenHealthRecords
 * @dev Secure, privacy-preserving medical records for women on BlockDAG
 * @dev Records are encrypted off-chain and stored on IPFS
 * @dev On-chain storage only contains IPFS CIDs and access permissions
 */
contract WomenHealthRecords {
    
    struct Record {
        string cid;            // IPFS content identifier
        uint256 timestamp;     // Upload time
        string recordType;     // Type of medical record
        string description;    // Brief description
    }

    struct Doctor {
        string name;
        string specialization;
        string licenseNumber;
        bool isVerified;
        uint256 verificationDate;
    }

    // Patient => list of records
    mapping(address => Record[]) private records;
    
    // Patient => (Doctor => permission)
    mapping(address => mapping(address => bool)) private accessGranted;
    
    // Doctor addresses => Doctor info
    mapping(address => Doctor) private doctors;
    
    // Patient => list of authorized doctors
    mapping(address => address[]) private authorizedDoctors;
    
    // Contract owner
    address public owner;
    
    // Events
    event RecordAdded(address indexed patient, string cid, uint256 timestamp, string recordType);
    event AccessGranted(address indexed patient, address indexed doctor, uint256 timestamp);
    event AccessRevoked(address indexed patient, address indexed doctor, uint256 timestamp);
    event DoctorRegistered(address indexed doctor, string name, string specialization);
    event DoctorVerified(address indexed doctor, uint256 timestamp);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyPatientOrAuthorized(address patient) {
        require(
            msg.sender == patient || accessGranted[patient][msg.sender],
            "Not authorized to access these records"
        );
        _;
    }
    
    modifier onlyDoctor() {
        require(doctors[msg.sender].isVerified, "Only verified doctors can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Patient adds encrypted record (IPFS CID)
     * @param cid IPFS content identifier
     * @param recordType Type of medical record
     * @param description Brief description of the record
     */
    function addRecord(
        string calldata cid, 
        string calldata recordType, 
        string calldata description
    ) external {
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(bytes(recordType).length > 0, "Record type cannot be empty");
        
        records[msg.sender].push(Record({
            cid: cid,
            timestamp: block.timestamp,
            recordType: recordType,
            description: description
        }));
        
        emit RecordAdded(msg.sender, cid, block.timestamp, recordType);
    }
    
    /**
     * @dev Patient grants access to a doctor
     * @param doctor Doctor's address
     */
    function grantDoctorAccess(address doctor) external {
        require(doctor != address(0), "Invalid doctor address");
        require(doctors[doctor].isVerified, "Doctor must be verified");
        require(!accessGranted[msg.sender][doctor], "Access already granted");
        
        accessGranted[msg.sender][doctor] = true;
        authorizedDoctors[msg.sender].push(doctor);
        
        emit AccessGranted(msg.sender, doctor, block.timestamp);
    }
    
    /**
     * @dev Patient revokes access from a doctor
     * @param doctor Doctor's address
     */
    function revokeDoctorAccess(address doctor) external {
        require(accessGranted[msg.sender][doctor], "Access not granted");
        
        accessGranted[msg.sender][doctor] = false;
        
        // Remove from authorized doctors list
        address[] storage authDoctors = authorizedDoctors[msg.sender];
        for (uint i = 0; i < authDoctors.length; i++) {
            if (authDoctors[i] == doctor) {
                authDoctors[i] = authDoctors[authDoctors.length - 1];
                authDoctors.pop();
                break;
            }
        }
        
        emit AccessRevoked(msg.sender, doctor, block.timestamp);
    }
    
    /**
     * @dev Doctor registers their information
     * @param name Doctor's name
     * @param specialization Doctor's specialization
     * @param licenseNumber Medical license number
     */
    function registerDoctor(
        string calldata name,
        string calldata specialization,
        string calldata licenseNumber
    ) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(specialization).length > 0, "Specialization cannot be empty");
        require(bytes(licenseNumber).length > 0, "License number cannot be empty");
        require(doctors[msg.sender].verificationDate == 0, "Doctor already registered");
        
        doctors[msg.sender] = Doctor({
            name: name,
            specialization: specialization,
            licenseNumber: licenseNumber,
            isVerified: false,
            verificationDate: 0
        });
        
        emit DoctorRegistered(msg.sender, name, specialization);
    }
    
    /**
     * @dev Owner verifies a doctor
     * @param doctor Doctor's address
     */
    function verifyDoctor(address doctor) external onlyOwner {
        require(doctors[doctor].verificationDate == 0, "Doctor already verified");
        require(doctors[doctor].verificationDate == 0, "Doctor not registered");
        
        doctors[doctor].isVerified = true;
        doctors[doctor].verificationDate = block.timestamp;
        
        emit DoctorVerified(doctor, block.timestamp);
    }
    
    /**
     * @dev View records if caller is patient or approved doctor
     * @param patient Patient's address
     * @return Array of records
     */
    function getRecords(address patient) external view onlyPatientOrAuthorized(patient) returns (Record[] memory) {
        return records[patient];
    }
    
    /**
     * @dev Get patient's own records
     * @return Array of records
     */
    function getMyRecords() external view returns (Record[] memory) {
        return records[msg.sender];
    }
    
    /**
     * @dev Get authorized doctors for a patient
     * @param patient Patient's address
     * @return Array of authorized doctor addresses
     */
    function getAuthorizedDoctors(address patient) external view returns (address[] memory) {
        require(msg.sender == patient, "Only patient can view authorized doctors");
        return authorizedDoctors[patient];
    }
    
    /**
     * @dev Get doctor information
     * @param doctor Doctor's address
     * @return Doctor struct
     */
    function getDoctorInfo(address doctor) external view returns (Doctor memory) {
        return doctors[doctor];
    }
    
    /**
     * @dev Check if doctor has access to patient records
     * @param patient Patient's address
     * @param doctor Doctor's address
     * @return True if access granted
     */
    function hasAccess(address patient, address doctor) external view returns (bool) {
        return accessGranted[patient][doctor];
    }
    
    /**
     * @dev Get total number of records for a patient
     * @param patient Patient's address
     * @return Number of records
     */
    function getRecordCount(address patient) external view onlyPatientOrAuthorized(patient) returns (uint256) {
        return records[patient].length;
    }
    
    /**
     * @dev Emergency function to revoke all access (patient only)
     */
    function emergencyRevokeAllAccess() external {
        address[] storage authDoctors = authorizedDoctors[msg.sender];
        
        for (uint i = 0; i < authDoctors.length; i++) {
            address doctor = authDoctors[i];
            if (accessGranted[msg.sender][doctor]) {
                accessGranted[msg.sender][doctor] = false;
                emit AccessRevoked(msg.sender, doctor, block.timestamp);
            }
        }
        
        // Clear the authorized doctors array
        delete authorizedDoctors[msg.sender];
    }
    
    /**
     * @dev Update contract owner (only current owner)
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}
