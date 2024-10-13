require("dotenv").config();
const fs = require("fs");
const { Web3 } = require("web3");
const { readDb, writeDb } = require('./tempdb');
const path = require('path');
const { toTimeStamp } = require('../utils/timestamp');
const network = process.env.ETHEREUM_NETWORK;
const assets = require(path.resolve('./db', "bond.json"));

const connectContract = (userid) => {
    let pKey = null;
    if (userid) {
        fetch(`http://localhost:3000/api/v1/custody/wallet/${userid}`)
            .then(async res => {
                // const resp = res.json();
                const response = await res.json();
                if (response.length > 0) {
                    pKey = response[0].privateKey;
                }
            })
            .catch(err => console.log('error', err));
    }
    const { abi, bytecode } = JSON.parse(fs.readFileSync(path.resolve("./", "DBToken.json")));
    
    const web3 = new Web3(
        new Web3.providers.HttpProvider(
            `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            { timeout: 10e3 }
        ),
    );
    const privateKey= userid && pKey ? pKey : ('0x' + process.env.SIGNER_PRIVATE_KEY);
    const signer = web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log('private Key', privateKey, signer);
    web3.eth.accounts.wallet.add(signer);

    // Using the signing account to deploy the contract
    const contract = new web3.eth.Contract(abi);
    contract.options.data = bytecode;
    return { contract, bytecode, signer, web3 };
};
const BondController = {
    registerBond: async (req, res) => {
        const { name, symbol, supply, isin, description, issuerName, maturityDate, price, nominalValue, yieldPercent, userid } = req.body;
        // console.log('date', maturityDate, toTimeStamp(maturityDate))
        if (!name || !symbol || !supply || !userid) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }

        const { contract, bytecode, signer } = connectContract(userid);
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
            txHash,
            txnUrl
        }
        const newData = { name, symbol, supply, isin, description, issuerName, maturityDate, price, nominalValue, yieldPercent, ...message };
        writeDb(newData, 'bond.json');
        res.status(201).json({ ...newData });

        //  res.status(201).json({"name":"Demo Token DB","symbol":"DBCOIN2","supply":4000,"isin":"300100","description":"This is demo DB token","issuerName":"AB Holding Company","maturityDate":"2030-05-25","price":"50","nominalValue":"800002033","yieldPercent":"2","scTemplateId":0,"contractAddress":"0x4034A8bf548d7C4AF21f35666Ce24F97fe836bC4","txHash":"0x4ea1576116ffa9bfdc77f14cdc761e3a74f6326edbc4329b3e6504f422dc433d","txnUrl":"https://sepolia.etherscan.io/tx/0x4ea1576116ffa9bfdc77f14cdc761e3a74f6326edbc4329b3e6504f422dc433d"});
    },
    transferBond: async (req, res) => {
        const { address, amount, userid, contractAddress } = req.body;
        if (!address || !amount || !userid) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }
          console.log('parameters', address, amount, userid, contractAddress);
          try {
              const { contract, web3, signer } = connectContract(userid);
              const privateKey = signer.privateKey;
              console.log('------here-----', signer.address)
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
