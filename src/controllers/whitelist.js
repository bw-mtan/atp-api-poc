require("dotenv").config();
const fs = require("fs");
const { Web3 } = require("web3");
const { readDb, writeDb } = require('./tempdb');
const path = require('path');
// This isn't used is it?
const network = process.env.ETHEREUM_NETWORK;

const getPrivateKey = async (userid) => {
    const response = await fetch(`http://localhost:3000/api/v1/custody/wallet/${userid}`);

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    return await response.json();
};

const connectContract = (pKey) => {
    const { abi, bytecode } = JSON.parse(fs.readFileSync(path.resolve("./", "Whitelist.json")));
    const web3 = new Web3(
        new Web3.providers.HttpProvider(
            `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            { timeout: 10e3 }
        ),
    );
    // Creating a signing account from a private key
    const pvtKey = pKey || ('0x' + process.env.SIGNER_PRIVATE_KEY);
    const signer = web3.eth.accounts.privateKeyToAccount(pvtKey);
    web3.eth.accounts.wallet.add(signer);

    // Using the signing account to deploy the contract
    const contract = new web3.eth.Contract(abi);
    contract.options.data = bytecode;
    return { contract, bytecode, signer, web3 };
};

const KYCController = {
    addWhitelistRegistrar: async (req, res) => {
        const { address, whitelistAddress, userid } = req.body;
        if (!address) {
            return res.status(500).json({ statusCode: 500, message: "Expected fields are not passed correctly." });
        }

        try {
            getPrivateKey(userid)
                .then(async resp => {
                    const pvtKey = resp ? resp[0].privateKey : null;
                    console.log('pvt', pvtKey);
                    const { contract, web3, signer } = connectContract(pvtKey);
                    console.log('------here-----', signer.address)
                    console.log('----contract----', await contract.address)
                    const data = contract.methods
                        .addToWhitelist(address)
                        .encodeABI();
                    const tx = {
                        from: signer.address,
                        data,
                        to: whitelistAddress,
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
                                    writeDb({ address, whitelistAddress }, 'whitelist.json');
                                    res.status(201).json({
                                        statusCode: 201,
                                        message: `Successfully whitelisted ${address}`,
                                        transactionHash: response.transactionHash,
                                        blockNumber: Number(response.blockNumber),
                                        // swapid: response.data,
                                        // resp: response
                                    })
                                })
                                .catch((err) => {
                                    console.log('----catch 1----', err.message)
                                    res.status(400).json({  statusCode: 400, message: err.message });
                                });
                        });
                }).catch(err => {
                    console.error('Error', err);
                    res.status(400).json(err);
                });

        } catch (error) {
            console.log('----catch 2----', error.message)
            res.status(400).json({   statusCode: 400,message: error.message });
        }
    },
    addWhitelistIssuer: async (req, res) => {
        const { address } = req.body;
        if (!address) {
            return res.status(500).json({   statusCode: 500,message: "Expected fields are not passed correctly." });
        }
        res.json("Issuer has been registered whitelisted.");
    },
    addWhitelistInvestor: async (req, res) => {
        const { address } = req.body;
        if (!address) {
            return res.status(500).json({   statusCode: 500,message: "Expected fields are not passed correctly." });
        }
        res.json("Investor has been successfully.");
    },


};

module.exports = { KYCController };