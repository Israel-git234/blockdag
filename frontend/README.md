# EmpowerHer - BlockDAG Women Empowerment Platform

A comprehensive blockchain-based platform designed to empower women in South Africa and beyond through social, health, and financial services.

## 🌟 Overview

EmpowerHer is a modular, scalable platform built on BlockDAG technology that provides:

## 🔗 BlockDAG Technology Integration

EmpowerHer leverages BlockDAG (Directed Acyclic Graph) technology for superior performance and scalability:

1. **Parallel Processing**: Unlike traditional blockchains that process transactions sequentially, BlockDAG allows multiple transactions to be processed simultaneously, dramatically increasing throughput and reducing wait times.

2. **Scalability**: BlockDAG's DAG structure eliminates the bottleneck of single-chain validation, enabling the platform to handle thousands of transactions per second while maintaining security and decentralization.

3. **Security**: The DAG structure provides inherent security through multiple validation paths, making it resistant to 51% attacks and ensuring the integrity of women's medical records, financial transactions, and social content.

4. **Cost Efficiency**: Lower transaction fees and faster confirmations make micro-transactions, stokvel contributions, and emergency aid distribution economically viable for all users.

- **Social**: Women-first content creation with on-chain rewards
- **Health & Safety**: Emergency response, medical records, and clinic bookings
- **Finance**: Grants, jobs, micro-donations, and stokvels
- **Wallet**: Non-custodial BlockDAG wallet with biometric security
- **Payment Card**: Instant spending with live FX rates
- **Explorer**: Full blockchain transparency and deep-linking

## 🏗️ System Architecture

### Frontend
- **React 19** with modern hooks and functional components
- **Tailwind CSS** for responsive, beautiful UI
- **Ethers.js** for blockchain interactions
- **Modular design** with separate components for each feature

### Smart Contracts (BlockDAG IDE)
- **EmpowerToken (EMW)**: ERC-20 token for the platform
- **CreatorRegistry**: KYC and expert verification
- **AdRevenuePool**: Automated creator payouts
- **CourseCertSBT**: Soulbound course certificates
- **ProviderRegistry**: Verified healthcare providers
- **MedRecordAnchor**: Tamper-proof medical records
- **ConsentPermit**: Cryptographic consent management
- **ClinicQueue**: Appointment booking system
- **SOSRegistry**: Emergency response coordination
- **AidEscrow**: Emergency aid and transport vouchers
- **GrantDAO**: Community voting and funding
- **JobBounty**: Escrowed job payments
- **SponsorStream**: Micro-donations and streams
- **Stokvel**: Traditional savings circles
- **CrowdFunding**: Campaign funding platform

## 🚀 Features

### 1. Social - "YouTube + Coursera" with On-Chain Rewards
- Women create channels (baby care, cooking, tech, AI, programming, law)
- Free courses with verifiable certificates
- Automatic creator payments from ad revenue pool
- Anti-fraud measures with proof-of-view oracles

### 2. Health & Safety - Care Nearby, Records Everywhere
- Map of assistance centers by province/community
- Tele-psychology and counseling services
- Medical record vault with FHIR compliance
- Queue-free hospital bookings
- Panic button with live location sharing
- Emergency transport vouchers

### 3. Finance - Jobs, Grants, and Community Support
- GrantDAO with quadratic voting
- Job bounty system with milestone payments
- Micro-donations and sponsorship streams
- Traditional stokvels on blockchain
- Crowdfunding campaigns

### 4. Wallet & Payment
- Non-custodial BlockDAG wallet
- Seed phrase security with biometric options
- Payment card for instant real-world spending
- Live FX rates and transaction receipts
- Export/import wallet functionality

### 5. Explorer & Transparency
- Real-time blockchain transparency
- Deep-links to all transactions
- Platform statistics and analytics
- Search by transaction hash, address, or block

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or compatible wallet
- BlockDAG testnet access

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
Create a `.env` file:
```env
REACT_APP_BLOCKDAG_RPC_URL=your_rpc_url
REACT_APP_CHAIN_ID=your_chain_id
REACT_APP_CONTRACT_ADDRESSES=your_contract_addresses
```

## 📱 Usage

### Getting Started
1. **Connect Wallet**: Click "Connect Wallet" to link MetaMask
2. **Navigate Tabs**: Use the top navigation to access different features
3. **Social**: Register as a creator and start earning from content
4. **Health**: Book appointments and access emergency services
5. **Finance**: Apply for grants, post jobs, or make donations
6. **Wallet**: Manage your EMW tokens and view transaction history
7. **Payment Card**: Spend your earnings instantly in stores
8. **Explorer**: View all blockchain activity transparently

### Key Workflows

#### Creator Journey
1. Register as creator in Social tab
2. Upload content (off-chain, hashes on-chain)
3. Earn from ad revenue pool automatically
4. Spend earnings via Payment Card

#### Health Emergency
1. Use SOS button in Health tab
2. Emergency responders notified via blockchain
3. Transport vouchers automatically released
4. Medical records updated with consent

#### Grant Funding
1. Create grant proposal in Finance tab
2. Community votes using quadratic voting
3. Top proposals automatically funded
4. Funds streamed to creators

## 🔒 Security & Privacy

### On-Chain vs Off-Chain
- **On-Chain**: Transaction hashes, consent tokens, payment records
- **Off-Chain**: Video content, medical records, personal data
- **Privacy**: ZK proofs for eligibility without revealing data

### Consent Management
- Time-bound, revocable access tokens
- Least-privilege access principles
- Cryptographic consent verification

### Anti-Fraud Measures
- Proof-of-view oracles
- Penalty slashing for violations
- KYC tiers for compliance

## 📊 KPIs & Metrics

### Social Impact
- Creator earnings and course completions
- Certificates issued and verified
- Content engagement metrics

### Health & Safety
- Appointments kept and record retrievals
- SOS response times and resolutions
- Voucher redemptions

### Financial Inclusion
- Total grants distributed
- Job bounties completed
- Stokvel participation and volume

### Trust & Transparency
- Percentage of actions with explorer proofs
- Consent revocation compliance
- Blockchain transaction volume

## 🌍 Global Scalability

### Region Packs
- Provider directories by country/region
- Local compliance profiles (KYC/AML tiers)
- Regional helplines and emergency services
- Cultural adaptation for different markets

### Modular Architecture
- Stateless frontend for global deployment
- Smart contract upgrades without code changes
- Localized content and language support

## 🎯 Demo Script (6 minutes)

1. **Social**: Publish lesson → oracle confirms metrics → AdRevenuePool pays → show on Explorer → tap Card to spend
2. **Health**: Book ClinicQueue slot → doctor requests ConsentPermit → view/update record → show new anchor on Explorer
3. **Safety**: Trigger SOSRegistry → emergency voucher from AidEscrow → redeem
4. **Finance**: Community votes on pitch → GrantDAO starts stream → Wallet receives → Card spend
5. **Finance (alt)**: Start Rosca → rotate payout → Explorer link

## 🔧 Development

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Wallet.jsx          # Non-custodial wallet
│   │   ├── PaymentCard.jsx     # Payment card interface
│   │   ├── Explorer.jsx        # Blockchain explorer
│   │   └── Finance.jsx         # Financial services
│   ├── App.jsx                 # Main application
│   └── main.jsx                # Entry point
├── contracts/                   # Smart contracts
├── public/                      # Static assets
└── package.json                 # Dependencies
```

### Smart Contract Deployment
```bash
# Deploy to BlockDAG testnet
npx hardhat run scripts/deploy.js --network blockdag-testnet

# Verify contracts
npx hardhat verify --network blockdag-testnet
```

### Testing
```bash
# Run tests
npm test

# Run specific test suite
npm test -- --grep "Social"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [docs.empowerher.com](https://docs.empowerher.com)
- **Community**: [discord.gg/empowerher](https://discord.gg/empowerher)
- **Issues**: [GitHub Issues](https://github.com/empowerher/blockdag/issues)

## 🙏 Acknowledgments

- BlockDAG team for blockchain infrastructure
- OpenZeppelin for secure smart contract libraries
- South African women's organizations for guidance
- Global blockchain community for inspiration

---

**EmpowerHer** - Building a more inclusive and empowered world, one block at a time.
