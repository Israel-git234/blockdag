// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Microfinance
 * @dev Smart contract for microfinance services on blockchain
 * @author Israel Mathivha - Women's Empowerment Platform
 */
contract Microfinance is Ownable, ReentrancyGuard, Pausable {
    uint256 private _loanIds = 0;
    uint256 private _savingsIds = 0;
    
    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 term;
        uint256 startDate;
        uint256 dueDate;
        uint256 amountRepaid;
        bool isActive;
        bool isRepaid;
        bool isDefaulted;
        string purpose;
        string ipfsHash; // For additional documentation
        uint256 creditScore;
    }
    
    struct Savings {
        uint256 id;
        address saver;
        uint256 amount;
        uint256 interestRate;
        uint256 startDate;
        uint256 lastInterestDate;
        bool isActive;
        string goal;
        uint256 targetAmount;
    }
    
    struct CreditScore {
        address user;
        uint256 score;
        uint256 lastUpdated;
        uint256 loansCompleted;
        uint256 loansDefaulted;
        uint256 totalBorrowed;
        uint256 totalRepaid;
    }
    
    // Constants
    uint256 public constant MIN_LOAN_AMOUNT = 100 * 10**18; // 100 ZAR
    uint256 public constant MAX_LOAN_AMOUNT = 10000 * 10**18; // 10,000 ZAR
    uint256 public constant MIN_LOAN_TERM = 30 days;
    uint256 public constant MAX_LOAN_TERM = 365 days;
    uint256 public constant BASE_INTEREST_RATE = 5; // 5% base rate
    uint256 public constant CREDIT_SCORE_BONUS = 2; // 2% bonus for good credit
    
    // State variables
    uint256 public totalLoansIssued;
    uint256 public totalLoansRepaid;
    uint256 public totalSavingsDeposits;
    uint256 public totalInterestPaid;
    uint256 public platformFee = 1; // 1% platform fee
    
    // Mappings
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => Savings) public savings;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public saverAccounts;
    mapping(address => CreditScore) public creditScores;
    mapping(address => bool) public authorizedLenders;
    mapping(address => uint256) public userTotalBorrowed;
    mapping(address => uint256) public userTotalRepaid;
    
    // Events
    event LoanIssued(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 term);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    event SavingsDeposited(uint256 indexed savingsId, address indexed saver, uint256 amount);
    event SavingsWithdrawn(uint256 indexed savingsId, address indexed saver, uint256 amount);
    event InterestPaid(uint256 indexed savingsId, address indexed saver, uint256 amount);
    event CreditScoreUpdated(address indexed user, uint256 newScore);
    event LenderAuthorized(address indexed lender);
    event LenderDeauthorized(address indexed lender);
    
    // Modifiers
    modifier onlyAuthorizedLender() {
        require(authorizedLenders[msg.sender] || msg.sender == owner(), "Microfinance: Only authorized lenders can perform this action");
        _;
    }
    
    modifier onlyBorrower(uint256 _loanId) {
        require(loans[_loanId].borrower == msg.sender, "Microfinance: Only borrower can perform this action");
        _;
    }
    
    modifier onlySaver(uint256 _savingsId) {
        require(savings[_savingsId].saver == msg.sender, "Microfinance: Only saver can perform this action");
        _;
    }
    
    modifier loanExists(uint256 _loanId) {
        require(loans[_loanId].id != 0, "Microfinance: Loan does not exist");
        _;
    }
    
    modifier savingsExists(uint256 _savingsId) {
        require(savings[_savingsId].id != 0, "Microfinance: Savings account does not exist");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Start from 1
    }
    
    /**
     * @dev Authorize a new lender
     * @param _lender Address of lender to authorize
     */
    function authorizeLender(address _lender) external onlyOwner {
        require(_lender != address(0), "Microfinance: Invalid lender address");
        require(!authorizedLenders[_lender], "Microfinance: Lender already authorized");
        
        authorizedLenders[_lender] = true;
        emit LenderAuthorized(_lender);
    }
    
    /**
     * @dev Deauthorize a lender
     * @param _lender Address of lender to deauthorize
     */
    function deauthorizeLender(address _lender) external onlyOwner {
        require(authorizedLenders[_lender], "Microfinance: Lender not authorized");
        
        authorizedLenders[_lender] = false;
        emit LenderDeauthorized(_lender);
    }
    
    /**
     * @dev Issue a new loan
     * @param _borrower Borrower's address
     * @param _amount Loan amount in wei
     * @param _term Loan term in seconds
     * @param _purpose Purpose of the loan
     * @param _ipfsHash IPFS hash for additional documentation
     */
    function issueLoan(
        address _borrower,
        uint256 _amount,
        uint256 _term,
        string memory _purpose,
        string memory _ipfsHash
    ) external onlyAuthorizedLender nonReentrant whenNotPaused {
        require(_borrower != address(0), "Microfinance: Invalid borrower address");
        require(_amount >= MIN_LOAN_AMOUNT, "Microfinance: Amount below minimum");
        require(_amount <= MAX_LOAN_AMOUNT, "Microfinance: Amount above maximum");
        require(_term >= MIN_LOAN_TERM, "Microfinance: Term too short");
        require(_term <= MAX_LOAN_TERM, "Microfinance: Term too long");
        require(bytes(_purpose).length > 0, "Microfinance: Purpose cannot be empty");
        
        // Calculate interest rate based on credit score
        uint256 interestRate = calculateInterestRate(_borrower);
        
        uint256 loanId = ++_loanIds;
        
        loans[loanId] = Loan({
            id: loanId,
            borrower: _borrower,
            amount: _amount,
            interestRate: interestRate,
            term: _term,
            startDate: block.timestamp,
            dueDate: block.timestamp + _term,
            amountRepaid: 0,
            isActive: true,
            isRepaid: false,
            isDefaulted: false,
            purpose: _purpose,
            ipfsHash: _ipfsHash,
            creditScore: creditScores[_borrower].score
        });
        
        borrowerLoans[_borrower].push(loanId);
        totalLoansIssued += _amount;
        userTotalBorrowed[_borrower] += _amount;
        
        // Update credit score
        updateCreditScore(_borrower, _amount, 0, false);
        
        emit LoanIssued(loanId, _borrower, _amount, _term);
    }
    
    /**
     * @dev Repay a loan
     * @param _loanId ID of loan to repay
     */
    function repayLoan(uint256 _loanId) external payable nonReentrant whenNotPaused {
        Loan storage loan = loans[_loanId];
        require(loan.isActive && !loan.isRepaid, "Microfinance: Loan not active or already repaid");
        require(msg.sender == loan.borrower, "Microfinance: Only borrower can repay");
        
        uint256 totalOwed = calculateTotalOwed(_loanId);
        require(msg.value >= totalOwed, "Microfinance: Insufficient payment");
        
        loan.amountRepaid = totalOwed;
        loan.isActive = false;
        loan.isRepaid = true;
        
        totalLoansRepaid += loan.amount;
        userTotalRepaid[msg.sender] += loan.amount;
        
        // Update credit score
        updateCreditScore(msg.sender, 0, loan.amount, true);
        
        emit LoanRepaid(_loanId, msg.sender, totalOwed);
        
        // Refund excess payment
        if (msg.value > totalOwed) {
            payable(msg.sender).transfer(msg.value - totalOwed);
        }
    }
    
    /**
     * @dev Create a savings account
     * @param _goal Savings goal description
     * @param _targetAmount Target amount to save
     */
    function createSavingsAccount(string memory _goal, uint256 _targetAmount) external whenNotPaused {
        require(bytes(_goal).length > 0, "Microfinance: Goal cannot be empty");
        require(_targetAmount > 0, "Microfinance: Target amount must be positive");
        
        uint256 savingsId = ++_savingsIds;
        
        savings[savingsId] = Savings({
            id: savingsId,
            saver: msg.sender,
            amount: 0,
            interestRate: BASE_INTEREST_RATE,
            startDate: block.timestamp,
            lastInterestDate: block.timestamp,
            isActive: true,
            goal: _goal,
            targetAmount: _targetAmount
        });
        
        saverAccounts[msg.sender].push(savingsId);
    }
    
    /**
     * @dev Deposit money into savings account
     * @param _savingsId ID of savings account
     */
    function depositSavings(uint256 _savingsId) external payable nonReentrant whenNotPaused {
        Savings storage account = savings[_savingsId];
        require(account.isActive, "Microfinance: Account not active");
        require(msg.sender == account.saver, "Microfinance: Only saver can deposit");
        require(msg.value > 0, "Microfinance: Amount must be positive");
        
        account.amount += msg.value;
        totalSavingsDeposits += msg.value;
        
        emit SavingsDeposited(_savingsId, msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw money from savings account
     * @param _savingsId ID of savings account
     * @param _amount Amount to withdraw
     */
    function withdrawSavings(uint256 _savingsId, uint256 _amount) external nonReentrant whenNotPaused {
        Savings storage account = savings[_savingsId];
        require(account.isActive, "Microfinance: Account not active");
        require(msg.sender == account.saver, "Microfinance: Only saver can withdraw");
        require(_amount > 0, "Microfinance: Amount must be positive");
        require(_amount <= account.amount, "Microfinance: Insufficient balance");
        
        account.amount -= _amount;
        totalSavingsDeposits -= _amount;
        
        payable(msg.sender).transfer(_amount);
        
        emit SavingsWithdrawn(_savingsId, msg.sender, _amount);
    }
    
    /**
     * @dev Calculate and pay interest on savings
     * @param _savingsId ID of savings account
     */
    function calculateInterest(uint256 _savingsId) external savingsExists(_savingsId) {
        Savings storage account = savings[_savingsId];
        require(account.isActive, "Microfinance: Account not active");
        require(block.timestamp >= account.lastInterestDate + 30 days, "Microfinance: Interest calculated too recently");
        
        uint256 daysSinceLastInterest = (block.timestamp - account.lastInterestDate) / 1 days;
        uint256 interest = (account.amount * account.interestRate * daysSinceLastInterest) / (365 * 100);
        
        if (interest > 0) {
            account.amount += interest;
            totalInterestPaid += interest;
            account.lastInterestDate = block.timestamp;
            
            emit InterestPaid(_savingsId, msg.sender, interest);
        }
    }
    
    /**
     * @dev Get borrower's loans
     * @param _borrower Borrower's address
     * @return Array of loan IDs
     */
    function getBorrowerLoans(address _borrower) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }
    
    /**
     * @dev Get saver's accounts
     * @param _saver Saver's address
     * @return Array of savings account IDs
     */
    function getSaverAccounts(address _saver) external view returns (uint256[] memory) {
        return saverAccounts[_saver];
    }
    
    /**
     * @dev Get loan details
     * @param _loanId ID of loan
     * @return Loan data
     */
    function getLoan(uint256 _loanId) external view loanExists(_loanId) returns (Loan memory) {
        return loans[_loanId];
    }
    
    /**
     * @dev Get savings account details
     * @param _savingsId ID of savings account
     * @return Savings data
     */
    function getSavings(uint256 _savingsId) external view savingsExists(_savingsId) returns (Savings memory) {
        return savings[_savingsId];
    }
    
    /**
     * @dev Get user's credit score
     * @param _user User's address
     * @return Credit score data
     */
    function getCreditScore(address _user) external view returns (CreditScore memory) {
        return creditScores[_user];
    }
    
    /**
     * @dev Calculate total amount owed on a loan
     * @param _loanId ID of loan
     * @return Total amount owed including interest
     */
    function calculateTotalOwed(uint256 _loanId) public view loanExists(_loanId) returns (uint256) {
        Loan storage loan = loans[_loanId];
        if (loan.isRepaid) return 0;
        
        uint256 daysElapsed = (block.timestamp - loan.startDate) / 1 days;
        uint256 interest = (loan.amount * loan.interestRate * daysElapsed) / (365 * 100);
        
        return loan.amount + interest;
    }
    
    /**
     * @dev Calculate interest rate based on credit score
     * @param _user User's address
     * @return Interest rate percentage
     */
    function calculateInterestRate(address _user) internal view returns (uint256) {
        uint256 score = creditScores[_user].score;
        
        if (score >= 800) {
            return BASE_INTEREST_RATE - CREDIT_SCORE_BONUS;
        } else if (score >= 600) {
            return BASE_INTEREST_RATE;
        } else {
            return BASE_INTEREST_RATE + 3; // Higher rate for low credit score
        }
    }
    
    /**
     * @dev Update user's credit score
     * @param _user User's address
     * @param _borrowed Amount borrowed
     * @param _repaid Amount repaid
     * @param _completed Whether loan was completed
     */
    function updateCreditScore(address _user, uint256 _borrowed, uint256 _repaid, bool _completed) internal {
        CreditScore storage score = creditScores[_user];
        
        if (score.user == address(0)) {
            score.user = _user;
            score.score = 600; // Starting score
            score.lastUpdated = block.timestamp;
        }
        
        if (_completed) {
            score.loansCompleted++;
            score.totalBorrowed += _borrowed;
            score.totalRepaid += _repaid;
            
            // Increase score for successful completion
            if (score.score < 850) {
                score.score += 10;
            }
        } else if (_borrowed > 0) {
            score.totalBorrowed += _borrowed;
        }
        
        score.lastUpdated = block.timestamp;
        
        emit CreditScoreUpdated(_user, score.score);
    }
    
    /**
     * @dev Check if loan is overdue
     * @param _loanId ID of loan
     * @return True if overdue, false otherwise
     */
    function isLoanOverdue(uint256 _loanId) external view loanExists(_loanId) returns (bool) {
        Loan storage loan = loans[_loanId];
        return loan.isActive && !loan.isRepaid && block.timestamp > loan.dueDate;
    }
    
    /**
     * @dev Get platform statistics
     * @return Total loans issued, total repaid, total savings, total interest paid
     */
    function getPlatformStats() external view returns (uint256, uint256, uint256, uint256) {
        return (totalLoansIssued, totalLoansRepaid, totalSavingsDeposits, totalInterestPaid);
    }
    
    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Microfinance: No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
