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
    const vars = {
        
    };

    res.render("menu", vars);
});

async function getMenuList() {
    const uri = process.env.MONGO_CONNECTION_STRING;
    const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1});

    try {
        await client.connect();
        const database = client.db(process.env.DATABASE_NAME);
        const collection = database.collection();

    } catch (e) {
        console.error(e);
    }
}