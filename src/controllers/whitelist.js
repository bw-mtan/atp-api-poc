require("dotenv").config();
const fs = require("fs");
const { Web3 } = require("web3");
const { readDb, writeDb } = require('./tempdb');
const path = require('path');
// This isn't used is it?
const network = process.env.ETHEREUM_NETWORK;
const connectContract = () => {
    const { abi, bytecode } = JSON.parse(fs.readFileSync(path.resolve("./", "Whitelist.json")));
    const network = process.env.ETHEREUM_NETWORK;
    const web3 = new Web3(
        new Web3.providers.HttpProvider(
            `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            { timeout: 10e3 }
        ),
    );
    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(
        '0x' + process.env.SIGNER_PRIVATE_KEY,
    );
    web3.eth.accounts.wallet.add(signer);

    // Using the signing account to deploy the contract
    const contract = new web3.eth.Contract(abi);
    contract.options.data = bytecode;
    return { contract, bytecode, signer, web3 };
}
const KYCController = {
    addWhitelistRegistrar: async (req, res) => {
        const { address, contractAddress, userid } = req.body;
        if (!address) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }

        try {
            console.log('testing', address);
            const { contract, web3, signer } = connectContract(userid);
            // const privateKey = '0x' + process.env.SIGNER_PRIVATE_KEY;
            console.log('------here-----', signer.address)
            const data = contract.methods
                .addToWhitelist(address)
                .encodeABI();
            const tx = {
                from: signer.address,
                data,
                // DBToken whitelist contract address inserted here
                to: contractAddress,
                gasPrice: await web3.eth.getGasPrice(),
                gas: 3000000 //await deployTx.estimateGas(),
            }
            console.log('-----try------')
            await web3.eth.accounts
                .signTransaction({ ...tx, data }, signer.privateKey)
                .then((signed) => {
                    console.log('SIGNED', signed);
                    web3.eth
                        .sendSignedTransaction(signed.rawTransaction)
                        .then((response) => {
                            console.log('-----', response);
                            res.status(201).json({
                                message: `Successfully whitelisted ${address}`,
                                transactionHash: response.transactionHash,
                                blockNumber: Number(response.blockNumber),
                                // swapid: response.data,
                                // resp: response
                            })
                        })
                        .catch((err) => {
                            console.log('----catch 1----', err.message)
                            res.status(400).json({ message: err.message });
                        });
                })
        } catch (error) {
            console.log('----catch 2----', error.message)
            res.status(400).json({ message: error.message });
        }
        // res.json("Registrar has been successfully whitelited.");
        //   return res.status(404).json({ message: "User not found" });
    },
    addWhitelistIssuer: async (req, res) => {
        const { address } = req.body;
        if (!address) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }
        res.json("Issuer has been registered whitelisted.");
    },
    addWhitelistInvestor: async (req, res) => {
        const { address } = req.body;
        if (!address) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }
        res.json("Investor has been successfully.");
    },


};

module.exports = { KYCController };