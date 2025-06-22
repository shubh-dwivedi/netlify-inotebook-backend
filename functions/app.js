const connectToMongo = require('../db');
const express = require("express");
const serverless = require("serverless-http");
const dotenv = require('dotenv');
dotenv.config();
connectToMongo();
var cors = require('cors')
const app = express();
const router = express.Router();

router.get("/", (req, res) => {
    res.send("App is running..");
});

router.post("/message", (req, res) => {
    const {title, description, tag} = JSON.parse(req.body);
    console.log(title)
    console.log(description)
    console.log(tag)
    console.log("Node app is running successfully...");
    res.send({message: "Node app is running successfully..."});
});

router.use('/api/auth', require('../routes/auth'))
router.use('/api/notes', require('../routes/notes'))

app.use(cors());
app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);
