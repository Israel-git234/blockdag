import { ethers } from 'ethers';

// Contract ABIs (you'll need to import these from your compiled contracts)
import MedicalRecordsABI from '../contracts/MedicalRecords.json';
import MicrofinanceABI from '../contracts/Microfinance.json';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isConnected = false;
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this platform.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask wallet.');
      }

      // Create provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      // Get network
      const network = await this.provider.getNetwork();
      console.log('Connected to network:', network.name);

      // Initialize contracts based on network
      await this.initializeContracts(network.chainId);

      this.isConnected = true;
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.signer = this.provider.getSigner();
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      return {
        success: true,
        account: accounts[0],
        network: network.name,
        chainId: network.chainId
      };

    } catch (error) {
      console.error('Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Initialize smart contracts
   */
  async initializeContracts(chainId) {
    try {
      // Contract addresses based on network
      const contractAddresses = this.getContractAddresses(chainId);
      
      if (!contractAddresses) {
        throw new Error(`Contracts not deployed on network with chainId: ${chainId}`);
      }

      // Initialize MedicalRecords contract
      this.contracts.medicalRecords = new ethers.Contract(
        contractAddresses.MedicalRecords,
        MedicalRecordsABI.abi,
        this.signer
      );

      // Initialize Microfinance contract
      this.contracts.microfinance = new ethers.Contract(
        contractAddresses.Microfinance,
        MicrofinanceABI.abi,
        this.signer
      );

      console.log('Smart contracts initialized successfully');
      
    } catch (error) {
      console.error('Contract initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get contract addresses based on network
   */
  getContractAddresses(chainId) {
    // These addresses should be updated after deployment
    const addresses = {
      11155111: { // Sepolia
        MedicalRecords: '0x...', // Update with actual address
        Microfinance: '0x...',   // Update with actual address
      },
      5: { // Goerli
        MedicalRecords: '0x...', // Update with actual address
        Microfinance: '0x...',   // Update with actual address
      },
      1337: { // Local Hardhat
        MedicalRecords: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        Microfinance: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      }
    };

    return addresses[chainId];
  }

  /**
   * Get current account
   */
  async getCurrentAccount() {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  /**
   * Get account balance
   */
  async getBalance(address = null) {
    if (!this.provider) return '0';
    
    const targetAddress = address || await this.getCurrentAccount();
    const balance = await this.provider.getBalance(targetAddress);
    return ethers.utils.formatEther(balance);
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isConnected = false;
  }

  // ===== MEDICAL RECORDS FUNCTIONS =====

  /**
   * Register a new doctor
   */
  async registerDoctor(name, specialization, licenseNumber) {
    try {
      if (!this.contracts.medicalRecords) {
        throw new Error('MedicalRecords contract not initialized');
      }

      const tx = await this.contracts.medicalRecords.registerDoctor(
        name,
        specialization,
        licenseNumber
      );

      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        message: 'Doctor registered successfully!'
      };

    } catch (error) {
      console.error('Doctor registration failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a medical record
   */
  async createMedicalRecord(patientAddress, hospitalName, diagnosis, treatment, medication, ipfsHash, isEmergency = false) {
    try {
      if (!this.contracts.medicalRecords) {
        throw new Error('MedicalRecords contract not initialized');
      }

      const tx = await this.contracts.medicalRecords.createMedicalRecord(
        patientAddress,
        hospitalName,
        diagnosis,
        treatment,
        medication,
        ipfsHash,
        isEmergency
      );

      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        message: 'Medical record created successfully!'
      };

    } catch (error) {
      console.error('Medical record creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get patient's medical records
   */
  async getPatientRecords(patientAddress) {
    try {
      if (!this.contracts.medicalRecords) {
        throw new Error('MedicalRecords contract not initialized');
      }

      const recordIds = await this.contracts.medicalRecords.getPatientRecords(patientAddress);
      const records = [];

      for (let i = 0; i < recordIds.length; i++) {
        const record = await this.contracts.medicalRecords.getMedicalRecord(recordIds[i]);
        records.push({
          id: record.id.toString(),
          patient: record.patient,
          hospitalName: record.hospitalName,
          doctorName: record.doctorName,
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          medication: record.medication,
          timestamp: new Date(record.timestamp * 1000).toISOString(),
          ipfsHash: record.ipfsHash,
          isVerified: record.isVerified,
          doctorAddress: record.doctorAddress,
          isEmergency: record.isEmergency
        });
      }

      return {
        success: true,
        records: records
      };

    } catch (error) {
      console.error('Failed to get medical records:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Grant emergency access
   */
  async grantEmergencyAccess(responderAddress, durationInSeconds) {
    try {
      if (!this.contracts.medicalRecords) {
        throw new Error('MedicalRecords contract not initialized');
      }

      const tx = await this.contracts.medicalRecords.grantEmergencyAccess(
        responderAddress,
        durationInSeconds
      );

      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        message: 'Emergency access granted successfully!'
      };

    } catch (error) {
      console.error('Emergency access grant failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== MICROFINANCE FUNCTIONS =====

  /**
   * Create a savings account
   */
  async createSavingsAccount(goal, targetAmount) {
    try {
      if (!this.contracts.microfinance) {
        throw new Error('Microfinance contract not initialized');
      }

      const tx = await this.contracts.microfinance.createSavingsAccount(
        goal,
        ethers.utils.parseEther(targetAmount.toString())
      );

      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        message: 'Savings account created successfully!'
      };

    } catch (error) {
      console.error('Savings account creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deposit into savings account
   */
  async depositSavings(savingsId, amount) {
    try {
      if (!this.contracts.microfinance) {
        throw new Error('Microfinance contract not initialized');
      }

      const tx = await this.contracts.microfinance.depositSavings(savingsId, {
        value: ethers.utils.parseEther(amount.toString())
      });

      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        message: 'Deposit successful!'
      };

    } catch (error) {
      console.error('Deposit failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's savings accounts
   */
  async getSavingsAccounts(userAddress) {
    try {
      if (!this.contracts.microfinance) {
        throw new Error('Microfinance contract not initialized');
      }

      const accountIds = await this.contracts.microfinance.getSaverAccounts(userAddress);
      const accounts = [];

      for (let i = 0; i < accountIds.length; i++) {
        const account = await this.contracts.microfinance.getSavings(accountIds[i]);
        accounts.push({
          id: account.id.toString(),
          saver: account.saver,
          amount: ethers.utils.formatEther(account.amount),
          interestRate: account.interestRate.toString(),
          startDate: new Date(account.startDate * 1000).toISOString(),
          lastInterestDate: new Date(account.lastInterestDate * 1000).toISOString(),
          isActive: account.isActive,
          goal: account.goal,
          targetAmount: ethers.utils.formatEther(account.targetAmount)
        });
      }

      return {
        success: true,
        accounts: accounts
      };

    } catch (error) {
      console.error('Failed to get savings accounts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's credit score
   */
  async getCreditScore(userAddress) {
    try {
      if (!this.contracts.microfinance) {
        throw new Error('Microfinance contract not initialized');
      }

      const creditScore = await this.contracts.microfinance.getCreditScore(userAddress);
      
      return {
        success: true,
        creditScore: {
          user: creditScore.user,
          score: creditScore.score.toString(),
          lastUpdated: new Date(creditScore.lastUpdated * 1000).toISOString(),
          loansCompleted: creditScore.loansCompleted.toString(),
          loansDefaulted: creditScore.loansDefaulted.toString(),
          totalBorrowed: ethers.utils.formatEther(creditScore.totalBorrowed),
          totalRepaid: ethers.utils.formatEther(creditScore.totalRepaid)
        }
      };

    } catch (error) {
      console.error('Failed to get credit score:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    try {
      if (!this.contracts.microfinance) {
        throw new Error('Microfinance contract not initialized');
      }

      const stats = await this.contracts.microfinance.getPlatformStats();
      
      return {
        success: true,
        stats: {
          totalLoansIssued: ethers.utils.formatEther(stats[0]),
          totalLoansRepaid: ethers.utils.formatEther(stats[1]),
          totalSavingsDeposits: ethers.utils.formatEther(stats[2]),
          totalInterestPaid: ethers.utils.formatEther(stats[3])
        }
      };

    } catch (error) {
      console.error('Failed to get platform stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Format ETH amount
   */
  formatEther(amount) {
    return ethers.utils.formatEther(amount);
  }

  /**
   * Parse ETH amount
   */
  parseEther(amount) {
    return ethers.utils.parseEther(amount.toString());
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash) {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const receipt = await this.provider.getTransactionReceipt(txHash);
      return {
        success: true,
        status: receipt.status === 1 ? 'success' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;
