"use strict";
const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "env/.env")
});


//searches the FDC database for food items
//returns an array of objects representing food items
async function search(query) {
    const apiRoute = "/v1/foods/search";
    
    const searchBody = {
        method: "POST",
        body : JSON.stringify({
            query: query,
            pageSize: 10,
            pageNumber:1,
        }),
        headers: {
            "Content-Type" : "application/json",
            "X-Api-Key" : process.env.API_KEY
        }
    }

    console.log(searchBody);
    const res = await fetch(process.env.API_SERVER + apiRoute, searchBody);

    return await res.json();
}

module.exports = {search};