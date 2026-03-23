async function main() {
  const CertCheck = await ethers.getContractFactory("CertCheck");
  const certCheck = await CertCheck.deploy();
  await certCheck.waitForDeployment();
  console.log("CertCheck deployed to:", await certCheck.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
