// Externals
import axios from "axios";
import { format } from "prettier";
import { writeFile, mkdir } from "fs/promises";
import Logger from "@hack4impact/logger";

// Internals
import { DATA_PATH, Weather, WEATHER_PATH } from "./constants";
import { retry } from "./services/helpers";

interface RawWeather {
  detailedForecast: string;
  icon: string;
}

const fetchWeather = async (): Promise<RawWeather> => {
  Logger.log("Fetching weather...");
  const res = await retry(
    () => axios.get("https://api.weather.gov/gridpoints/MTR/102,97/forecast"),
    3
  );
  const weather = res.data.properties.periods[0];
  Logger.success("Fetched weather!");
  return weather;
};

const getWeather = async () => {
  await mkdir(DATA_PATH, { recursive: true });

  const weather = await fetchWeather();

  const data: Weather = {
    forecast: weather.detailedForecast,
    icon: weather.icon,
  };

  Logger.log("Writing weather...");
  const formattedData = format(JSON.stringify(data), {
    parser: "json-stringify",
  });

  await writeFile(WEATHER_PATH, formattedData);
  Logger.success("Wrote weather!");
};

getWeather();
