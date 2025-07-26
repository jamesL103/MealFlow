"use strict";
const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "env/.env")
});
const {MongoClient, ServerApiVersion} = require("mongodb");
const ObjectId = require("mongodb").ObjectId;


//puts the meal object into the database
async function put(mealObj) {
    console.log(mealObj)
    const uri = process.env.MONGO_CONNECTION_STRING;
    const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1});
    try {
        await client.connect();
        const database = client.db(process.env.DATABASE_NAME);
        const collection = database.collection(process.env.COLLECTION_NAME);

        const result = await collection.insertOne(mealObj);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function remove(id) {
    console.log("Removing entry " +  id);
    const uri = process.env.MONGO_CONNECTION_STRING;
    const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1});
    try {
        await client.connect();
        const database = client.db(process.env.DATABASE_NAME);
        const collection = database.collection(process.env.COLLECTION_NAME);
        const query = {"_id": new ObjectId("" + id)};
        const result = await collection.deleteOne(query);
        return result;
    } catch (e) {
        console.error(e);
        return "Error: Couldn't Remove DB entry: " + e;
    } finally {
        await client.close();
    }
}

module.exports = {put, remove};