const BondController = {
    registerBond: (req, res) => {
      res.json("Bond registered successfully.");
      //   return res.status(404).json({ message: "User not found" });
    },
    transferBond:(req,res)=>{
        res.json("Bond Transfer was successfully.")
    }
   
  };
  
  module.exports = { BondController };