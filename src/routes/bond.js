const { Router } = require("express");
const { BondController } = require("../controllers/bond.js");

const router = new Router();
router.post("/api/v1/bond/register", BondController.registerBond);
router.post("/api/v1/bond/transfer", BondController.transferBond);
module.exports = { router };