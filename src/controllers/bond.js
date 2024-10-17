require("dotenv").config();
const fs = require("fs");
const { Web3 } = require("web3");
const { readDb, writeDb } = require('./tempdb');
const path = require('path');
const { toTimeStamp } = require('../utils/timestamp');
const network = process.env.ETHEREUM_NETWORK;
const assets = require(path.resolve('./db', "bond.json"));

const getPrivateKey = async (userid) => {
    const response = await fetch(`http://localhost:3000/api/v1/custody/wallet/${userid}`);

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    return await response.json();
};
const connectContract = (pKey) => {
    const { abi, bytecode } = JSON.parse(fs.readFileSync(path.resolve("./", "DBToken.json")));

    const web3 = new Web3(
        new Web3.providers.HttpProvider(
            `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            { timeout: 10e3 }
        ),
    );
    const pvtKey = pKey || ('0x' + process.env.SIGNER_PRIVATE_KEY);
    const signer = web3.eth.accounts.privateKeyToAccount(pvtKey);
    console.log('private Key', pvtKey, signer);
    web3.eth.accounts.wallet.add(signer);

    // Using the signing account to deploy the contract
    const contract = new web3.eth.Contract(abi);
    contract.options.data = bytecode;
    return { contract, bytecode, signer, web3 };
}
const BondController = {
    registerBond: async (req, res) => {
        const { name, symbol, supply, isin, description, issuerName, maturityDate, price, nominalValue, yieldPercent, userid } = req.body;
        // console.log('date', maturityDate, toTimeStamp(maturityDate))
        if (!name || !symbol || !supply || !userid) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }
        getPrivateKey(userid).then(async resp => {
            const pvtKey = resp ? resp[0].privateKey : null;
            console.log('pvt', pvtKey)
            const { contract, bytecode, signer } = connectContract(pvtKey);
            const deployTx = contract.deploy({
                data: bytecode,
                arguments: [name, symbol, supply, description, issuerName, Number(isin), Number(price * 100), Number(nominalValue * 100), toTimeStamp(maturityDate), Number(yieldPercent * 100)]
            });
            let txHash = null;
            let txnUrl = null;
            const deployedContract = await deployTx
                .send({
                    from: signer.address,
                    gas: 3000000 //await deployTx.estimateGas(),
                })
                .once("transactionHash", (txhash) => {
                    txHash = txhash;
                    txnUrl = `https://${network}.etherscan.io/tx/${txhash}`;
                    console.log(`Mining deployment transaction ...${txnUrl}`);
                });
            const message = {
                contractAddress: deployedContract.options.address,
                whitelistAddress: await deployedContract.methods.getWhitelistAddress().call(),
                txHash,
                txnUrl
            }
            const newData = { name, symbol, supply, isin, description, issuerName, maturityDate, price, nominalValue, yieldPercent, ...message };
            writeDb(newData, 'bond.json');
            res.status(201).json({ ...newData });

        }).catch(err => {
            console.error('Error', err);
            res.status(400).json(err);
        });


        //  res.status(201).json({"name":"Demo Token DB","symbol":"DBCOIN2","supply":4000,"isin":"300100","description":"This is demo DB token","issuerName":"AB Holding Company","maturityDate":"2030-05-25","price":"50","nominalValue":"800002033","yieldPercent":"2","scTemplateId":0,"contractAddress":"0x4034A8bf548d7C4AF21f35666Ce24F97fe836bC4","txHash":"0x4ea1576116ffa9bfdc77f14cdc761e3a74f6326edbc4329b3e6504f422dc433d","txnUrl":"https://sepolia.etherscan.io/tx/0x4ea1576116ffa9bfdc77f14cdc761e3a74f6326edbc4329b3e6504f422dc433d"});
    },
    transferBond: async (req, res) => {
        const { address, amount, userid, contractAddress } = req.body;
        if (!address || !amount || !userid) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }
        console.log('parameters', address, amount, userid, contractAddress);
        try {
            getPrivateKey(userid)
                .then(async resp => {
                    const pvtKey = resp ? resp[0].privateKey : null;
                    const { contract, signer,web3 } = connectContract(pvtKey);
                    const privateKey = signer.privateKey;
                    const data = contract.methods
                        .transferToken(address, amount)
                        .encodeABI();
                    const tx = {
                        from: signer.address,
                        data,
                        to: contractAddress,
                        gasPrice: await web3.eth.getGasPrice(),
                        gas: 3000000 //await deployTx.estimateGas(),
                    }
                    await web3.eth.accounts
                        .signTransaction({ ...tx, data }, privateKey)
                        .then((signed) => {
                            web3.eth
                                .sendSignedTransaction(signed.rawTransaction)
                                .then((response) => {
                                    res.status(201).json({
                                        message: `Successful transfer of ${amount} tokens to ${address}`,
                                        transactionHash: response.transactionHash,
                                        blockNumber: Number(response.blockNumber),
                                        // swapid: response.data,
                                        // resp: response
                                    })
                                })
                                .catch((err) => {
                                    console.error('----catch 1----', err.message)
                                    res.status(400).json({ message: err.message });
                                });
                        })
                }).catch(err => {
                    console.error('Error', err);
                    res.status(400).json(err);
                });
        } catch (error) {
            console.error('----catch 2----', error.message)
            res.status(400).json({ message: error.message });
        }

    },
    listAllBond: async (req, res) => {
        await res.status(200).json(assets);
    }

};

module.exports = { BondController };
