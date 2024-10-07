const KYCController = {
    whitelistRegistrar: (req, res) => {
      res.json("Registrar has been successfully whitelited.");
      //   return res.status(404).json({ message: "User not found" });
    },
    whitelistIssuer: (req, res) => {
        res.json("Issuer has been registered whitelisted.");
      },
    whitelistInvestor: (req, res) => {
        res.json("Investor has been successfully.");
      },
   
   
  };
  
  module.exports = { KYCController };