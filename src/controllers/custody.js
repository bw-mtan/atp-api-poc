require("dotenv").config();
const { clear } = require("console");
const path = require("path");
const custody = require(path.resolve('./db', "custody.json"));
const users = require(path.resolve('./db', "users.json"));

const CustodyController = {
    listWallets: async (req, res) => {
        await res.status(200).json(custody);
    },
    getWallet: async (req, res) => {
        const { id } = req.params;
        const user = users.filter(x=>x.userid === id);
        const data = custody.filter(x => x.userid === id);
        const mapData = {
            ...data,
            ...user[0]
        };
        return await res.status(200).json(mapData);
    },
    getWalletsByRole: async (req, res) => {
        const { id } = req.params;
        const user = users.filter(x=>x.roleName === id).map(x=>x.userid);
        const filterInvestor = custody.filter(x=>user.indexOf(x.userid)>-1);
        return await res.status(200).json(filterInvestor);
    },
}
module.exports = { CustodyController };