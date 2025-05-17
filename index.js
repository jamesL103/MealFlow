"use strict";
const express = require("express");
const app = express();
const port = 5000;
const staticPath = "static";
const path = require("path");
const mealViewRouter = require("./mealViewRouter");
const bodyParser = require("body-parser");
const {search} = require("./apiSearch");

const publicPath = path.resolve(__dirname, staticPath);
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}));

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));
app.use("/viewMeals", mealViewRouter);

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "static/main.html"));
});

app.get("/createMeal", (req,res) => {
    res.render("createMeal");
});

app.post("/search/", async (req, res) => {
    console.log(req.body);
    const result = await search(req.body.query);
    console.log(result);
    const foodsArray = result.foods;
    if (result.status == 400) {
        res.status(400).send("Error: " + result.message);
    } else {
        res.send(JSON.stringify(foodsArray));
    }
});


app.listen(port, () => {

});
