// Contract ABIs imported from Hardhat artifacts
import AssistanceCenterRegistryABI from './AssistanceCenterRegistry.json';
import EmergencyAlertABI from './EmergencyAlert.json';
import CounselorMarketplaceABI from './CounselorMarketplace.json';
import WomenHealthRecordsABI from './WomenHealthRecords.json';
import SistaCircleABI from './SistaCircle.json';

export {
  AssistanceCenterRegistryABI,
  EmergencyAlertABI,
  CounselorMarketplaceABI,
  WomenHealthRecordsABI,
  SistaCircleABI
};

// Type-safe ABI exports
export const ABIS = {
  AssistanceCenterRegistry: AssistanceCenterRegistryABI.abi,
  EmergencyAlert: EmergencyAlertABI.abi,
  CounselorMarketplace: CounselorMarketplaceABI.abi,
  WomenHealthRecords: WomenHealthRecordsABI.abi,
  SistaCircle: SistaCircleABI.abi
} as const;
