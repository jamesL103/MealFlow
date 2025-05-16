"use strict";
const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "env/.env")
});

const {MongoClient, ServerApiVersion} = require("mongodb");



router.get("/", async (req, res) => {
    const list = await getMenuList();
    let html = `Found ${list.length} items<br>`;
    for (const menuObj of list) {
        html += `<a href="/viewMeals/${menuObj.name}">${menuObj.name}</a><br>`;
    }

    const vars = {
        listHtml: html
    };

    res.render("menu", vars);
});

//returns an array of objects storing meal names and ids
async function getMenuList() {
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

module.exports = router;