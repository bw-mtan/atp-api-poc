const KYCController = {
    addWhitelistRegistrar: (req, res) => {
        const { address } = req.body;
        if (!address) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }
        res.json("Registrar has been successfully whitelited.");
        //   return res.status(404).json({ message: "User not found" });
    },
    addWhitelistIssuer: (req, res) => {
        const { address } = req.body;
        if (!address) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }
        res.json("Issuer has been registered whitelisted.");
    },
    addWhitelistInvestor: (req, res) => {
        const { address } = req.body;
        if (!address) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }
        res.json("Investor has been successfully.");
    },


};

module.exports = { KYCController };