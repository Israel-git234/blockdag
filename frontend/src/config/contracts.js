import { ethers } from 'ethers';

// Contract addresses from your BlockDAG deployment
export const CONTRACT_ADDRESSES = {
  EMPOWER_TOKEN: "0x9c82eCC0388A27255121726Fa68a505FA2EB17D4",
  COURSE_CERT_SBT: "0x6703F333Cd4C27B1f9A19E9a4dC39C346055106a",
  GRANT_DAO: "0xfe209F738e5bbeaf4B4acb954e5C5347E072f6Df",
  JOB_BOUNTY: "0xD93111E3C9E9C68C1BaE07F1E3c5f3ce483c9b8f",
  SPONSOR_STREAM: "0xFA0875e339160B0F78B138939015Dc628596A224",
  AID_ESCROW: "0xECDa59EBEb3fBbd15EECF03719B31eb02a077801",
  STOKVEL: "0xEc66F046C3809Fc029594bAeE02a2dBd058E1A60",
  CROWD_FUNDING: "0x9a0ED98ff619d15B41f57b57a149f64e516b2916"
};

// Network configuration for BlockDAG Primordial Testnet
export const NETWORK_CONFIG = {
  CHAIN_ID: 1043,
  RPC_URL: "https://rpc.primordial.bdagscan.com",
  EXPLORER_URL: "https://primordial.bdagscan.com/"
};

// Contract ABIs - these will be imported from the artifacts
export const CONTRACT_NAMES = {
  EMPOWER_TOKEN: 'EmpowerToken',
  COURSE_CERT_SBT: 'CourseCertSBT',
  GRANT_DAO: 'GrantDAO',
  JOB_BOUNTY: 'JobBounty',
  SPONSOR_STREAM: 'SponsorStream',
  AID_ESCROW: 'AidEscrow',
  STOKVEL: 'Stokvel',
  CROWD_FUNDING: 'CrowdFunding'
};

// Helper function to get contract ABI
export const getContractABI = async (contractName) => {
  try {
    // Import the ABI from the artifacts
    const artifact = await import(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
    return artifact.abi;
  } catch (error) {
    console.error(`Failed to load ABI for ${contractName}:`, error);
    return null;
  }
};

// Helper function to initialize all contracts
export const initializeContracts = async (signer) => {
  const contractInstances = {};
  
  for (const [key, address] of Object.entries(CONTRACT_ADDRESSES)) {
    const contractName = CONTRACT_NAMES[key];
    if (contractName) {
      const abi = await getContractABI(contractName);
      if (abi) {
        contractInstances[key] = new ethers.Contract(address, abi, signer);
      }
    }
  }
  
  return contractInstances;
};
