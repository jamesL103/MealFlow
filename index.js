"use strict";
const express = require("express");
const app = express();
const port = 5000;
const staticPath = "static";
const path = require("path");
const mealViewRouter = require("./mealViewRouter");
const bodyParser = require("body-parser");
const {search} = require("./apiSearch");

const {put} = require("./MongoDBManager");

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

//handle search request
app.post("/search/", async (req, res) => {
    console.log(req.body);
    const result = await search(req.body.query);
    console.log(result);
    const foodsArray = result.foods;
    if (result.status == 400) {
        res.status(400).send("Error: " + result.message);
    } else if (result.error?.code === "OVER_RATE_LIMIT") {
        res.send("Error: over FDC API rate limit");
    } else {
        res.send(JSON.stringify(foodsArray));
    }
});

//handle create form submission
app.post("/createMeal/submit", async (req, res) => {
    let {name, foods} = req.body;

    const foodArray=JSON.parse(foods);

    let mealObj = {
        name: name,
        foods: foodArray
    }

    await put(mealObj);

});


app.listen(port, () => {

});
