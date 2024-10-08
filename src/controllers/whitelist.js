const KYCController = {
    addWhitelistRegistrar: (req, res) => {
      res.json("Registrar has been successfully whitelited.");
      //   return res.status(404).json({ message: "User not found" });
    },
    addWhitelistIssuer: (req, res) => {
        res.json("Issuer has been registered whitelisted.");
      },
    addWhitelistInvestor: (req, res) => {
        res.json("Investor has been successfully.");
      },
   
   
  };
  
  module.exports = { KYCController };