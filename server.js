const express = require("express");
const axios = require("axios");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const FILE = "checks.json";

app.post("/check", async (req, res) => {
    const url = req.body.url;

    try {
        const start = Date.now();
        const response = await axios.get(url);
        const latency = Date.now() - start;

        const result = { status: "UP", latency };
        saveData(url, result);

        res.json(result);

    } catch {
        exec(`node validate.js ${url}`);

        const result = { status: "DOWN", latency: 0 };
        saveData(url, result);

        res.json(result);
    }
});
app.get("/history", (req, res) => {
    const fs = require("fs");
    const data = JSON.parse(fs.readFileSync("checks.json"));
    res.json(data);
});
function saveData(url, result) {
    let data = [];

    try {
        data = JSON.parse(fs.readFileSync(FILE));
    } catch {
        data = [];
    }

    data.unshift({ url, ...result, time: new Date() });
    data = data.slice(0, 10);

    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
});