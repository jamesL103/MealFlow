"use strict";
const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "env/.env")
});

const {MongoClient, ServerApiVersion} = require("mongodb");



router.get("/", async (req, res) => {
    const list = await getMealList();
    let html = `Found ${list.length} item`;
    if (list.length != 1) {
        html += "s";
    }
    html += "<br>";


    for (const menuObj of list) {
        html += `<a href="/viewMeals/${menuObj.name}">${menuObj.name}</a><br>`;
    }

    const vars = {
        listHtml: html
    };

    res.render("meals", vars);
});

router.get("/:mealName", async (req, res) => {
    const {mealName} = req.params;
    const mealObj = await getMeal(mealName);
    let html = "";

    if (mealObj == null) {
        html = "No foods in the meal";
    } else {
        html += `<table><thead><th>Food</th><th>Calories</th></thead>`;
        const apiRequestRoute = "/v1/foods"
        const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Api-Key" : process.env.API_KEY
                }
        };

        //create the get url parameters containing the FDC ID for each food item
        let idParam = "?fdcIds=";

        for (const id of mealObj.foods) {
            idParam += id + ",";
        }
        idParam = idParam.slice(0, idParam.length - 1);

        //GET request the array of food items
        //note: can only accept up to 20 items
        let apiResponse = await fetch(process.env.API_SERVER + apiRequestRoute + idParam + "&format=abridged&nutrients=208", options);
        console.log(apiResponse);
        let foodItems = await apiResponse.json();

        //add every food item into the html list display
        for (const foodItem of foodItems) {
            
            console.log(foodItem);

            html += `<tr><td>${foodItem.description}</td><td>${foodItem.foodNutrients[0].amount}</td></tr>`
        }

        html += "</table>";
    }

    const vars = {
        name: mealName,
        foodListHtml : html
    }

    res.render("viewMeal", vars);
});

//returns an array of objects storing meal names and ids
async function getMealList() {
    const uri = process.env.MONGO_CONNECTION_STRING;
    const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1});

    try {
        await client.connect();
        const database = client.db(process.env.DATABASE_NAME);
        const collection = database.collection(process.env.COLLECTION_NAME);
        const projection = {name: 1};
        const mealsCursor = collection.find({}).project(projection);
        const toReturn = await mealsCursor.toArray();
        return toReturn;
    } catch (e) {
        console.error(e);
    }
}

//returns a meal object from the database with the specified name
//returns null if meal with name not found
async function getMeal(name) {
    const uri = process.env.MONGO_CONNECTION_STRING;
    const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1});

    try {
        await client.connect();
        const database = client.db(process.env.DATABASE_NAME);
        const collection = database.collection(process.env.COLLECTION_NAME);
        const projection = {name: name};

        return await collection.findOne(projection);

    } catch (e) {

    }
}

module.exports = router;