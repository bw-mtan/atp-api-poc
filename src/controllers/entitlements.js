
const path=require("path");
const roles = require(path.resolve('./db', "role.json"));
const users = require(path.resolve('./db', "users.json"));
const EntitlementController = {
    getRoles: async (req, res) => {
        await res.status(200).json(roles);
    },
    getUsers:async(req,res)=>{
        await res.status(200).json(users);
    }
}
module.exports = { EntitlementController };