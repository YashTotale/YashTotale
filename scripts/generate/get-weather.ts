// Environment Variables
import { config } from "dotenv-safe";
config();

// Externals
import axios from "axios";
import { format } from "prettier";
import { writeFile, mkdir } from "fs/promises";

// Internals
import { DATA_PATH, Weather, WEATHER_PATH } from "./constants";

const IMAGES = [
  "https://trivalleyconnect.org/wp-content/uploads/2019/06/pleasanton-008.jpg",
  "https://www.pleasantondowntown.net/assets/uploads/42c3d-gallery.png",
  "https://ap.rdcpix.com/062b5c9978434bf1ec7f764d664cc194l-m1665611412xd-w1020_h770_q80.jpg",
];

const fetchWeather = async () => {
  const res = await axios.get(
    "https://api.weather.gov/gridpoints/MTR/102,97/forecast"
  );
  const weather = res.data.properties.periods[0];
  return weather;
};

const getWeather = async () => {
  await mkdir(DATA_PATH, { recursive: true });

  const weather = await fetchWeather();
  const data: Weather = {
    forecast: weather.detailedForecast,
    images: IMAGES,
    icon: weather.icon,
  };
  const formattedData = format(JSON.stringify(data), {
    parser: "json-stringify",
  });

  await writeFile(WEATHER_PATH, formattedData);
};

getWeather();
