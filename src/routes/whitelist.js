const { Router } = require("express");
const { KYCController } = require("../controllers/whitelist.js");

const router = new Router();
router.post("/api/v1/whitelist/registrar", KYCController.addWhitelistRegistrar);
router.post("/api/v1/whitelist/issuer", KYCController.addWhitelistIssuer);
router.post("/api/v1/whitelist/investor", KYCController.addWhitelistInvestor);

module.exports = { router };
