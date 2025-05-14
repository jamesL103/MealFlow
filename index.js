"use strict";
const express = require("express");
const app = express();
const port = 5000;
const staticPath = "static";
const path = require("path");

const publicPath = path.resolve(__dirname, staticPath);
app.use(express.static(publicPath));

app.get("/", (req, res) => {
    res.sendFile("index.html");
});

app.listen(port, () => {

});
