const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require('cors');

// initialize an Express application
const app = express();
app.use(express.json());
var corsOptions = {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use('/',cors(corsOptions));

// connect to the "src/routers" directory
const routersPath = path.join(__dirname, "routes");
app.get("/", (req, res) => {
    res.json("Welcome to ATP API");
})
// read all files in the "/src/routers" directory
fs.readdirSync(routersPath).forEach((file) => {
    if (file.endsWith(".js")) {
        // dynamically import the router module
        const routerModule = require(path.join(routersPath, file));

        // get the "router" object exported by the router module
        const router = routerModule.router;

        // register the router
        app.use(router);
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});