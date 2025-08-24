const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to BlockDAG Primordial Testnet...");

  // Deploy EmpowerToken first (base token)
  console.log("📝 Deploying EmpowerToken...");
  const EmpowerToken = await hre.ethers.getContractFactory("EmpowerToken");
  const empowerToken = await EmpowerToken.deploy();
  await empowerToken.waitForDeployment();
  const empowerTokenAddress = await empowerToken.getAddress();
  console.log("✅ EmpowerToken deployed to:", empowerTokenAddress);

  // Deploy CourseCertSBT
  console.log("📚 Deploying CourseCertSBT...");
  const CourseCertSBT = await hre.ethers.getContractFactory("CourseCertSBT");
  const courseCertSBT = await CourseCertSBT.deploy(empowerTokenAddress);
  await courseCertSBT.waitForDeployment();
  const courseCertSBTAddress = await courseCertSBT.getAddress();
  console.log("✅ CourseCertSBT deployed to:", courseCertSBTAddress);

  // Deploy GrantDAO
  console.log("🏛️ Deploying GrantDAO...");
  const GrantDAO = await hre.ethers.getContractFactory("GrantDAO");
  const grantDAO = await GrantDAO.deploy(empowerTokenAddress);
  await grantDAO.waitForDeployment();
  const grantDAOAddress = await grantDAO.getAddress();
  console.log("✅ GrantDAO deployed to:", grantDAOAddress);

  // Deploy JobBounty
  console.log("💼 Deploying JobBounty...");
  const JobBounty = await hre.ethers.getContractFactory("JobBounty");
  const jobBounty = await JobBounty.deploy(empowerTokenAddress);
  await jobBounty.waitForDeployment();
  const jobBountyAddress = await jobBounty.getAddress();
  console.log("✅ JobBounty deployed to:", jobBountyAddress);

  // Deploy SponsorStream
  console.log("💸 Deploying SponsorStream...");
  const SponsorStream = await hre.ethers.getContractFactory("SponsorStream");
  const sponsorStream = await SponsorStream.deploy(empowerTokenAddress);
  await sponsorStream.waitForDeployment();
  const sponsorStreamAddress = await sponsorStream.getAddress();
  console.log("✅ SponsorStream deployed to:", sponsorStreamAddress);

  // Deploy AidEscrow
  console.log("🚑 Deploying AidEscrow...");
  const AidEscrow = await hre.ethers.getContractFactory("AidEscrow");
  const aidEscrow = await AidEscrow.deploy(empowerTokenAddress);
  await aidEscrow.waitForDeployment();
  const aidEscrowAddress = await aidEscrow.getAddress();
  console.log("✅ AidEscrow deployed to:", aidEscrowAddress);

  // Deploy Stokvel
  console.log("💰 Deploying Stokvel...");
  const Stokvel = await hre.ethers.getContractFactory("Stokvel");
  const stokvel = await Stokvel.deploy(empowerTokenAddress);
  await stokvel.waitForDeployment();
  const stokvelAddress = await stokvel.getAddress();
  console.log("✅ Stokvel deployed to:", stokvelAddress);

  // Deploy CrowdFunding
  console.log("🎯 Deploying CrowdFunding...");
  const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
  const crowdFunding = await CrowdFunding.deploy(empowerTokenAddress);
  await crowdFunding.waitForDeployment();
  const crowdFundingAddress = await crowdFunding.getAddress();
  console.log("✅ CrowdFunding deployed to:", crowdFundingAddress);

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n�� Contract Addresses:");
  console.log("EmpowerToken:", empowerTokenAddress);
  console.log("CourseCertSBT:", courseCertSBTAddress);
  console.log("GrantDAO:", grantDAOAddress);
  console.log("JobBounty:", jobBountyAddress);
  console.log("SponsorStream:", sponsorStreamAddress);
  console.log("AidEscrow:", aidEscrowAddress);
  console.log("Stokvel:", stokvelAddress);
  console.log("CrowdFunding:", crowdFundingAddress);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
