const express = require('express');
const app = express();
app.get("/msg", (req, res, next) => {
    res.json({ "message": "Hello, Spencer!" });
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});