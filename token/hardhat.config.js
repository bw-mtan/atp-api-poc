require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: "0.8.26",
    networks: {
      localhost: {
          url: "http://127.0.0.1:8545"
        },
      hardhat: {
      },
      sepolia: {
        url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        accounts: [process.env.DEPLOYER_PRIVATE_KEY.toString()]
      }
    }
  };
  