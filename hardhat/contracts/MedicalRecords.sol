// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MedicalRecords
 * @dev Smart contract for managing medical records on blockchain
 * @author Israel Mathivha - Women's Empowerment Platform
 */
contract MedicalRecords is Ownable, ReentrancyGuard {
    uint256 private _recordIds = 0;
    uint256 private _doctorIds = 0;
    
    struct MedicalRecord {
        uint256 id;
        address patient;
        string hospitalName;
        string doctorName;
        string diagnosis;
        string treatment;
        string medication;
        uint256 timestamp;
        string ipfsHash;
        bool isVerified;
        address doctorAddress;
        bool isEmergency;
    }
    
    struct Doctor {
        uint256 id;
        address doctorAddress;
        string name;
        string specialization;
        string licenseNumber;
        bool isVerified;
        uint256 timestamp;
    }
    
    struct EmergencyAccess {
        address emergencyResponder;
        uint256 expiryTime;
        bool isActive;
    }
    
    // Mappings
    mapping(uint256 => MedicalRecord) public records;
    mapping(address => uint256[]) public patientRecords;
    mapping(address => Doctor) public doctors;
    mapping(address => bool) public authorizedDoctors;
    mapping(address => EmergencyAccess[]) public emergencyAccess;
    mapping(address => mapping(address => bool)) public patientDoctorAccess;
    
    // Events
    event RecordCreated(uint256 indexed recordId, address indexed patient, address indexed doctor);
    event RecordUpdated(uint256 indexed recordId, address indexed patient);
    event DoctorRegistered(address indexed doctorAddress, string name);
    event EmergencyAccessGranted(address indexed patient, address indexed responder, uint256 expiryTime);
    event EmergencyAccessRevoked(address indexed patient, address indexed responder);
    
    // Modifiers
    modifier onlyAuthorizedDoctor() {
        require(authorizedDoctors[msg.sender], "MedicalRecords: Only authorized doctors can perform this action");
        _;
    }
    
    modifier onlyPatientOrDoctor(uint256 _recordId) {
        require(
            records[_recordId].patient == msg.sender || 
            records[_recordId].doctorAddress == msg.sender ||
            patientDoctorAccess[records[_recordId].patient][msg.sender],
            "MedicalRecords: Access denied"
        );
        _;
    }
    
    modifier onlyPatient(address _patient) {
        require(msg.sender == _patient, "MedicalRecords: Only patient can perform this action");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Start from 1
    }
    
    /**
     * @dev Register a new doctor
     * @param _name Doctor's full name
     * @param _specialization Doctor's specialization
     * @param _licenseNumber Medical license number
     */
    function registerDoctor(
        string memory _name,
        string memory _specialization,
        string memory _licenseNumber
    ) external {
        require(bytes(_name).length > 0, "MedicalRecords: Name cannot be empty");
        require(bytes(_specialization).length > 0, "MedicalRecords: Specialization cannot be empty");
        require(bytes(_licenseNumber).length > 0, "MedicalRecords: License number cannot be empty");
        require(doctors[msg.sender].doctorAddress == address(0), "MedicalRecords: Doctor already registered");
        
        uint256 doctorId = ++_doctorIds;
        
        doctors[msg.sender] = Doctor({
            id: doctorId,
            doctorAddress: msg.sender,
            name: _name,
            specialization: _specialization,
            licenseNumber: _licenseNumber,
            isVerified: false,
            timestamp: block.timestamp
        });
        
        emit DoctorRegistered(msg.sender, _name);
    }
    
    /**
     * @dev Verify a doctor (only owner can do this)
     * @param _doctorAddress Address of doctor to verify
     */
    function verifyDoctor(address _doctorAddress) external onlyOwner {
        require(doctors[_doctorAddress].doctorAddress != address(0), "MedicalRecords: Doctor not found");
        require(!doctors[_doctorAddress].isVerified, "MedicalRecords: Doctor already verified");
        
        doctors[_doctorAddress].isVerified = true;
        authorizedDoctors[_doctorAddress] = true;
    }
    
    /**
     * @dev Create a new medical record
     * @param _patient Patient's wallet address
     * @param _hospitalName Name of hospital/clinic
     * @param _diagnosis Medical diagnosis
     * @param _treatment Treatment provided
     * @param _medication Medication prescribed
     * @param _ipfsHash IPFS hash of detailed medical data
     * @param _isEmergency Whether this is an emergency record
     */
    function createMedicalRecord(
        address _patient,
        string memory _hospitalName,
        string memory _diagnosis,
        string memory _treatment,
        string memory _medication,
        string memory _ipfsHash,
        bool _isEmergency
    ) external onlyAuthorizedDoctor nonReentrant {
        require(_patient != address(0), "MedicalRecords: Invalid patient address");
        require(bytes(_hospitalName).length > 0, "MedicalRecords: Hospital name cannot be empty");
        require(bytes(_diagnosis).length > 0, "MedicalRecords: Diagnosis cannot be empty");
        require(bytes(_ipfsHash).length > 0, "MedicalRecords: IPFS hash cannot be empty");
        
        uint256 recordId = ++_recordIds;
        
        records[recordId] = MedicalRecord({
            id: recordId,
            patient: _patient,
            hospitalName: _hospitalName,
            doctorName: doctors[msg.sender].name,
            diagnosis: _diagnosis,
            treatment: _treatment,
            medication: _medication,
            timestamp: block.timestamp,
            ipfsHash: _ipfsHash,
            isVerified: true,
            doctorAddress: msg.sender,
            isEmergency: _isEmergency
        });
        
        patientRecords[_patient].push(recordId);
        
        // Grant doctor access to patient records
        patientDoctorAccess[_patient][msg.sender] = true;
        
        emit RecordCreated(recordId, _patient, msg.sender);
    }
    
    /**
     * @dev Update an existing medical record
     * @param _recordId ID of record to update
     * @param _diagnosis Updated diagnosis
     * @param _treatment Updated treatment
     * @param _medication Updated medication
     * @param _ipfsHash Updated IPFS hash
     */
    function updateMedicalRecord(
        uint256 _recordId,
        string memory _diagnosis,
        string memory _treatment,
        string memory _medication,
        string memory _ipfsHash
    ) external onlyPatientOrDoctor(_recordId) {
        require(records[_recordId].id != 0, "MedicalRecords: Record does not exist");
        require(bytes(_diagnosis).length > 0, "MedicalRecords: Diagnosis cannot be empty");
        require(bytes(_ipfsHash).length > 0, "MedicalRecords: IPFS hash cannot be empty");
        
        records[_recordId].diagnosis = _diagnosis;
        records[_recordId].treatment = _treatment;
        records[_recordId].medication = _medication;
        records[_recordId].ipfsHash = _ipfsHash;
        records[_recordId].timestamp = block.timestamp;
        
        emit RecordUpdated(_recordId, records[_recordId].patient);
    }
    
    /**
     * @dev Grant emergency access to a responder
     * @param _responder Address of emergency responder
     * @param _duration Duration of access in seconds
     */
    function grantEmergencyAccess(address _responder, uint256 _duration) external onlyPatient(msg.sender) {
        require(_responder != address(0), "MedicalRecords: Invalid responder address");
        require(_duration > 0, "MedicalRecords: Duration must be greater than 0");
        
        EmergencyAccess memory newAccess = EmergencyAccess({
            emergencyResponder: _responder,
            expiryTime: block.timestamp + _duration,
            isActive: true
        });
        
        emergencyAccess[msg.sender].push(newAccess);
        
        emit EmergencyAccessGranted(msg.sender, _responder, block.timestamp + _duration);
    }
    
    /**
     * @dev Revoke emergency access
     * @param _responderIndex Index of responder in emergency access array
     */
    function revokeEmergencyAccess(uint256 _responderIndex) external onlyPatient(msg.sender) {
        require(_responderIndex < emergencyAccess[msg.sender].length, "MedicalRecords: Invalid responder index");
        
        emergencyAccess[msg.sender][_responderIndex].isActive = false;
        
        emit EmergencyAccessRevoked(msg.sender, emergencyAccess[msg.sender][_responderIndex].emergencyResponder);
    }
    
    /**
     * @dev Get patient's medical records
     * @param _patient Patient's address
     * @return Array of record IDs
     */
    function getPatientRecords(address _patient) external view returns (uint256[] memory) {
        return patientRecords[_patient];
    }
    
    /**
     * @dev Get medical record by ID
     * @param _recordId ID of the record
     * @return Medical record data
     */
    function getMedicalRecord(uint256 _recordId) external view returns (MedicalRecord memory) {
        require(records[_recordId].id != 0, "MedicalRecords: Record does not exist");
        return records[_recordId];
    }
    
    /**
     * @dev Check if address has emergency access to patient records
     * @param _patient Patient's address
     * @param _responder Responder's address
     * @return True if has access, false otherwise
     */
    function hasEmergencyAccess(address _patient, address _responder) external view returns (bool) {
        EmergencyAccess[] memory accesses = emergencyAccess[_patient];
        
        for (uint256 i = 0; i < accesses.length; i++) {
            if (accesses[i].emergencyResponder == _responder && 
                accesses[i].isActive && 
                accesses[i].expiryTime > block.timestamp) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Get doctor information
     * @param _doctorAddress Doctor's address
     * @return Doctor data
     */
    function getDoctor(address _doctorAddress) external view returns (Doctor memory) {
        return doctors[_doctorAddress];
    }
    
    /**
     * @dev Get total number of records
     * @return Total record count
     */
    function getTotalRecords() external view returns (uint256) {
        return _recordIds;
    }
    
    /**
     * @dev Get total number of doctors
     * @return Total doctor count
     */
    function getTotalDoctors() external view returns (uint256) {
        return _doctorIds;
    }
    
    /**
     * @dev Emergency function to pause contract (only owner)
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause
    }
}
