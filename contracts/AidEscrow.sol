// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EmpowerToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AidEscrow
 * @dev Emergency aid and transport voucher management
 */
contract AidEscrow is ReentrancyGuard, Ownable {
    EmpowerToken public immutable empowerToken;
    
    struct Voucher {
        address recipient;
        uint256 amount;
        uint256 expiryTime;
        bool isRedeemed;
        bool isExpired;
        string voucherType; // "transport", "medical", "food", etc.
        string description;
    }
    
    struct AidRequest {
        address requester;
        uint256 amount;
        string reason;
        uint256 requestTime;
        bool isApproved;
        bool isFulfilled;
        address approver;
    }
    
    uint256 public voucherCounter = 0;
    uint256 public aidRequestCounter = 0;
    
    mapping(uint256 => Voucher) public vouchers;
    mapping(uint256 => AidRequest) public aidRequests;
    mapping(address => uint256[]) public userVouchers;
    mapping(address => uint256[]) public userAidRequests;
    
    uint256 public emergencyFundBalance = 0;
    uint256 public maxVoucherAmount = 100 * 10**18; // 100 EMW
    uint256 public voucherExpiryTime = 24 hours;
    
    event VoucherCreated(uint256 indexed voucherId, address indexed recipient, uint256 amount, string voucherType);
    event VoucherRedeemed(uint256 indexed voucherId, address indexed recipient, uint256 amount);
    event VoucherExpired(uint256 indexed voucherId, address indexed recipient);
    event AidRequested(uint256 indexed requestId, address indexed requester, uint256 amount, string reason);
    event AidApproved(uint256 indexed requestId, address indexed approver);
    event AidFulfilled(uint256 indexed requestId, address indexed recipient, uint256 amount);
    event EmergencyFundDeposited(address indexed depositor, uint256 amount);
    
    constructor(address _empowerTokenAddress) Ownable(msg.sender) {
        empowerToken = EmpowerToken(_empowerTokenAddress);
    }
    
    /**
     * @dev Create emergency transport voucher (only owner/authorized)
     */
    function createVoucher(
        address _recipient,
        uint256 _amount,
        string memory _voucherType,
        string memory _description
    ) public onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0 && _amount <= maxVoucherAmount, "Invalid amount");
        require(emergencyFundBalance >= _amount, "Insufficient emergency funds");
        
        uint256 voucherId = voucherCounter++;
        vouchers[voucherId] = Voucher({
            recipient: _recipient,
            amount: _amount,
            expiryTime: block.timestamp + voucherExpiryTime,
            isRedeemed: false,
            isExpired: false,
            voucherType: _voucherType,
            description: _description
        });
        
        userVouchers[_recipient].push(voucherId);
        emergencyFundBalance -= _amount;
        
        emit VoucherCreated(voucherId, _recipient, _amount, _voucherType);
    }
    
    /**
     * @dev Redeem voucher for tokens
     */
    function redeemVoucher(uint256 _voucherId) public nonReentrant {
        require(_voucherId < voucherCounter, "Invalid voucher ID");
        Voucher storage voucher = vouchers[_voucherId];
        require(msg.sender == voucher.recipient, "Only recipient can redeem");
        require(!voucher.isRedeemed, "Already redeemed");
        require(!voucher.isExpired, "Voucher expired");
        require(block.timestamp < voucher.expiryTime, "Voucher expired");
        
        voucher.isRedeemed = true;
        
        // Transfer tokens to recipient
        bool success = empowerToken.transfer(voucher.recipient, voucher.amount);
        require(success, "Transfer failed");
        
        emit VoucherRedeemed(_voucherId, voucher.recipient, voucher.amount);
    }
    
    /**
     * @dev Expire expired vouchers and return funds to emergency pool
     */
    function expireVouchers() public {
        for (uint256 i = 0; i < voucherCounter; i++) {
            Voucher storage voucher = vouchers[i];
            if (!voucher.isRedeemed && !voucher.isExpired && block.timestamp >= voucher.expiryTime) {
                voucher.isExpired = true;
                emergencyFundBalance += voucher.amount;
                emit VoucherExpired(i, voucher.recipient);
            }
        }
    }
    
    /**
     * @dev Request emergency aid
     */
    function requestAid(
        uint256 _amount,
        string memory _reason
    ) public {
        require(_amount > 0 && _amount <= maxVoucherAmount, "Invalid amount");
        require(bytes(_reason).length > 0, "Reason required");
        
        uint256 requestId = aidRequestCounter++;
        aidRequests[requestId] = AidRequest({
            requester: msg.sender,
            amount: _amount,
            reason: _reason,
            requestTime: block.timestamp,
            isApproved: false,
            isFulfilled: false,
            approver: address(0)
        });
        
        userAidRequests[msg.sender].push(requestId);
        emit AidRequested(requestId, msg.sender, _amount, _reason);
    }
    
    /**
     * @dev Approve aid request (only owner/authorized)
     */
    function approveAid(uint256 _requestId) public onlyOwner {
        require(_requestId < aidRequestCounter, "Invalid request ID");
        AidRequest storage request = aidRequests[_requestId];
        require(!request.isApproved, "Already approved");
        require(!request.isFulfilled, "Already fulfilled");
        
        request.isApproved = true;
        request.approver = msg.sender;
        
        emit AidApproved(_requestId, msg.sender);
    }
    
    /**
     * @dev Fulfill approved aid request
     */
    function fulfillAid(uint256 _requestId) public nonReentrant {
        require(_requestId < aidRequestCounter, "Invalid request ID");
        AidRequest storage request = aidRequests[_requestId];
        require(request.isApproved, "Request not approved");
        require(!request.isFulfilled, "Already fulfilled");
        require(emergencyFundBalance >= request.amount, "Insufficient emergency funds");
        
        request.isFulfilled = true;
        emergencyFundBalance -= request.amount;
        
        // Transfer tokens to requester
        bool success = empowerToken.transfer(request.requester, request.amount);
        require(success, "Transfer failed");
        
        emit AidFulfilled(_requestId, request.requester, request.amount);
    }
    
    /**
     * @dev Deposit funds to emergency fund
     */
    function depositEmergencyFund(uint256 _amount) public {
        require(_amount > 0, "Amount must be positive");
        
        bool success = empowerToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");
        
        emergencyFundBalance += _amount;
        emit EmergencyFundDeposited(msg.sender, _amount);
    }
    
    /**
     * @dev Get voucher details
     */
    function getVoucher(uint256 _voucherId) public view returns (Voucher memory) {
        require(_voucherId < voucherCounter, "Invalid voucher ID");
        return vouchers[_voucherId];
    }
    
    /**
     * @dev Get aid request details
     */
    function getAidRequest(uint256 _requestId) public view returns (AidRequest memory) {
        require(_requestId < aidRequestCounter, "Invalid request ID");
        return aidRequests[_requestId];
    }
    
    /**
     * @dev Get user's vouchers
     */
    function getUserVouchers(address _user) public view returns (uint256[] memory) {
        return userVouchers[_user];
    }
    
    /**
     * @dev Get user's aid requests
     */
    function getUserAidRequests(address _user) public view returns (uint256[] memory) {
        return userAidRequests[_user];
    }
    
    /**
     * @dev Get emergency fund balance
     */
    function getEmergencyFundBalance() public view returns (uint256) {
        return emergencyFundBalance;
    }
    
    /**
     * @dev Update max voucher amount (only owner)
     */
    function setMaxVoucherAmount(uint256 _newAmount) public onlyOwner {
        maxVoucherAmount = _newAmount;
    }
    
    /**
     * @dev Update voucher expiry time (only owner)
     */
    function setVoucherExpiryTime(uint256 _newTime) public onlyOwner {
        voucherExpiryTime = _newTime;
    }
    
    /**
     * @dev Get total vouchers count
     */
    function getVouchersCount() public view returns (uint256) {
        return voucherCounter;
    }
    
    /**
     * @dev Get total aid requests count
     */
    function getAidRequestsCount() public view returns (uint256) {
        return aidRequestCounter;
    }
}
