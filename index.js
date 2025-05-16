"use strict";
const express = require("express");
const app = express();
const port = 5000;
const staticPath = "static";
const path = require("path");
const mealViewRouter = require("./mealViewRouter");

const publicPath = path.resolve(__dirname, staticPath);
app.use(express.static(publicPath));

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));
app.use("/viewMeals", mealViewRouter);

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "static/main.html"));
});

app.get("/createMeal", (req,res) => {
    res.render("createMeal");
});


app.listen(port, () => {

});
