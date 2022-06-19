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

app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => res.render("home"));

app.post("/", (req, res) => {
    const queryLocation = req.body.location;
    const apiKey = process.env.API_KEY;
    const unit = "metric";
    //API Call
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + queryLocation + "&appid=" + apiKey + "&units=" + unit;
    https.get(url, (response) => {
        response.on("data", (data) => {
            const weatherData = JSON.parse(data);
            console.log(weatherData);
            //Unknown location error
            if (weatherData.cod === "404") {
                const errorCode = weatherData.cod;
                const errorMessage = (weatherData.message).toUpperCase();
                res.render("error", { errorCode: errorCode, errorMessage: errorMessage });
            //Successful Call    
            } else if (weatherData.cod === "200") {
                const temp = Math.round(weatherData.main.temp);
                const feelsLike = Math.round(weatherData.main.feels_like);
                const minTemp = Math.round(weatherData.main.temp_min);
                const maxTemp = Math.round(weatherData.main.temp_max);
                const humidity = Math.round(weatherData.main.humidity);
                const description = (weatherData.weather[0].description).toUpperCase();
                // console.log(description);
                const iconURL = "https://openweathermap.org/img/wn/" + weatherData.weather[0].icon + "@2x.png"
                const wind = Math.round((weatherData.wind.speed) * 2.237
                );
            //Data Render    
                res.render("query", { Location: queryLocation, Description: description, Temperature: temp, FeelsLike: feelsLike, MaxTemperature: maxTemp, MinTemperature: minTemp, Humidity: humidity, iconURL: iconURL, wind: wind });
            // Unknown Error    
            } else {
                res.render("error", { errorCode: "ERROR", errorMessage: "Please try again later." });
            }
        })
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))