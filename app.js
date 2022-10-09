//Packages
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
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
app.get("/", (req, res) => res.render("home", { stylesheet: "home" }));

//Query Request
app.post("/", (req, res) => {

    const queryLocation = req.body.location;
    const apiKey = process.env.API_KEY;
    const unit = "metric";

    //API Call
    const url = "https://api.openweathermap.org/data/2.5/forecast?q=" + queryLocation + "&appid=" + apiKey + "&units=" + unit;

    https.get(url, (response) => {
        let chunks = "";
        response.on("data", (chunk) => {
            chunks += chunk;
        });
        response.on("end", () => {
            const weatherData = JSON.parse(chunks);
            const { cod, message, cnt, list, city } = weatherData;

            //Unknown location error === 404
            if (cod === "404") {
                const errorCode = cod;
                const errorMessage = (message).toUpperCase();
                res.render("error", { errorCode: errorCode, errorMessage: errorMessage, stylesheet: "error" });

                //Successful Call === 200   
            } else if (cod === "200") {
                const iconURLStart = "https://openweathermap.org/img/wn/"
                const iconURLEnd = "@2x.png"

                const currentDate = (new Date()).getDay();
                let [weatherSun, weatherMon, weatherTue, weatherWed, weatherThur, weatherFri, weatherSat, currentWeather, weatherTomorrow, weatherDay3, weatherDay4, weatherDay5] = [[], [], [], [], [], [], []];

                for (let i = 0; i < 40; i++) {
                    let weatherDay = (new Date(list[i].dt_txt)).getDay();
                    switch (weatherDay) {
                        case 0: weatherSun.push(list[i]);
                            break;
                        case 1: weatherMon.push(list[i]);
                            break;
                        case 2: weatherTue.push(list[i]);
                            break;
                        case 3: weatherWed.push(list[i]);
                            break;
                        case 4: weatherThur.push(list[i]);
                            break;
                        case 5: weatherFri.push(list[i]);
                            break;
                        case 6: weatherSat.push(list[i]);
                            break;
                        default: console.log("array sort error");
                    }

                    switch (currentDate) {
                        case 0: currentWeather = weatherSun;
                            weatherTomorrow = weatherMon;
                            weatherDay3 = weatherTue;
                            weatherDay4 = weatherWed;
                            weatherDay5 = weatherThur;
                            break;
                        case 1: currentWeather = weatherMon;
                            weatherTomorrow = weatherTue;
                            weatherDay3 = weatherWed;
                            weatherDay4 = weatherThur;
                            weatherDay5 = weatherFri;
                            break;
                        case 2: currentWeather = weatherTue;
                            weatherTomorrow = weatherWed;
                            weatherDay3 = weatherThur;
                            weatherDay4 = weatherFri;
                            weatherDay5 = weatherSat;
                            break;
                        case 3: currentWeather = weatherWed;
                            weatherTomorrow = weatherThur;
                            weatherDay3 = weatherFri;
                            weatherDay4 = weatherSat;
                            weatherDay5 = weatherSun;
                            break;
                        case 4: currentWeather = weatherThur;
                            weatherTomorrow = weatherFri;
                            weatherDay3 = weatherSat;
                            weatherDay4 = weatherSun;
                            weatherDay5 = weatherMon;
                            break;
                        case 5: currentWeather = weatherFri;
                            weatherTomorrow = weatherSat;
                            weatherDay3 = weatherSun;
                            weatherDay4 = weatherMon;
                            weatherDay5 = weatherTue;
                            break;
                        case 6: currentWeather = weatherSat;
                            weatherTomorrow = weatherSun;
                            weatherDay3 = weatherMon;
                            weatherDay4 = weatherTue;
                            weatherDay5 = weatherWed;
                            break;
                        default: console.log("day assigning error");
                    }
                };

                //Function to change wind degrees to direction
                function getCardinalDirection(angle) {
                    const directions = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW'];
                    return directions[Math.round(angle / 45) % 8];
                };

                //Function to get day
                function getArrayDay(array) {
                    const day = new Date(array[0].dt_txt).toLocaleString('en-us', { weekday: 'long' });
                    return day
                }

                //Data Render    
                res.render("query", {
                    currentWeather: currentWeather,
                    weatherTomorrow: weatherTomorrow,
                    weatherDay3: weatherDay3,
                    weatherDay4: weatherDay4,
                    weatherDay5: weatherDay5,
                    city: city,
                    iconURLStart: iconURLStart,
                    iconURLEnd: iconURLEnd,
                    stylesheet: "query",
                    getCardinalDirection: getCardinalDirection,
                    getArrayDay: getArrayDay
                });

                // Unknown Error    
            } else {
                res.render("error", { errorCode: "", errorMessage: "No location entered. Please try again", stylesheet: "error" });
            }
        })
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
