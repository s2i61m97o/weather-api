//Packages
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const { query } = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const app = express()
const port = 3000

//EJS Setup
app.set("view engine", "ejs")

//CSS Setup
app.use(express.static(__dirname + '/public'));

//Body-Parser
app.use(bodyParser.urlencoded({ extended: true }));

//Homepage Render
app.get("/", (req, res) => res.render("home"));

//Query Request
app.post("/", (req, res) => {

    const queryLocation = req.body.location;
    const apiKey = process.env.API_KEY;
    const unit = "metric";

    //API Call
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + queryLocation + "&appid=" + apiKey + "&units=" + unit;

    https.get(url, (response) => {
        response.on("data", (data) => {
            const weatherData = JSON.parse(data);
            const { coord, weather, base, main, visibility, wind, clouds, dt, sts, timezone, id, name, cod, message } = weatherData;

            //Unknown location error === 404
            if (cod === "404") {
                const errorCode = cod;
                const errorMessage = (message).toUpperCase();
                res.render("error", { errorCode: errorCode, errorMessage: errorMessage });

                //Successful Call === 200   
            } else if (cod === 200) {
                const iconURL = "https://openweathermap.org/img/wn/" + weather[0].icon + "@2x.png"

                //Data Render    
                res.render("query", { main: main, weather: weather, wind: wind, name: name, iconURL: iconURL });

                // Unknown Error    
            } else {
                res.render("error", { errorCode: "", errorMessage: "No location entered. Please try again" });
            }
        })
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))