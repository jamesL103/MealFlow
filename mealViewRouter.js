"use strict";
const express = require("express");
const router = express.Router();
const path = require("path");
const {_ ,remove} = require("./MongoDBManager")
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
    html += "<br><table>";

    for (const menuObj of list) {
        html += `<tr>
        <td><a href="/viewMeals/meal/${menuObj.name}">${menuObj.name}</a></td><td><button type="button" data-id="${menuObj._id}" onclick=deleteButtonCallback(event)>Delete Meal</button>
        </tr>
        `;
    }

    html += "</table>"

    const vars = {
        listHtml: html,
        list: list
    };

    res.render("meals", vars);
});



router.post("/deleteEntry", (req, res) => {
    const id = req.body.id;
    console.log("Received delete request for " + id);
    res.send(new Promise((resolve, reject) => {
        remove(id).then((result)=> {
            if (result.deletedCount == 1) {
                console.log("Successfully deleted entry " + id);
                resolve({deletedCount: result.deletedCount});
            } else {
                console.log("No documents matched query. Failed to delete entry " + id);
                reject("Failed to delete entry " + id);
            }
        }).catch((reason)=> {
            console.log("Error: Couldn't delete entry: " + reason);
        });
    }));
    
});

router.get("/meal/:mealName", async (req, res) => {
    const {mealName} = req.params;
    const mealObj = await getMeal(mealName);
    console.log("Displaying Meal: ");
    console.log(mealObj);
    let html = "";

    if (mealObj == null || mealObj.foods == undefined || mealObj.foods.length == 0) {
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
            
            // console.log(foodItem);

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