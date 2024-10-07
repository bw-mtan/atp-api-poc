async function main() {
  
    const _token = await ethers.getContractFactory("MyToken");
    const token = await _token.deploy("Test Token", "TST", 100000);
    const contract = await token.waitForDeployment();
  
    console.log("TokenizedBond deployed to:", await contract.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });