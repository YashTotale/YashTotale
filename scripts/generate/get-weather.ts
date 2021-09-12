// Externals
import axios from "axios";
import { format } from "prettier";
import { writeFile, mkdir } from "fs/promises";
import { join, relative } from "path";
import Logger from "@hack4impact/logger";

// Internals
import {
  DATA_PATH,
  PLEASANTON_ASSETS_PATH,
  ROOT_PATH,
  Weather,
  WEATHER_PATH,
} from "./constants";
import { retry } from "./services/helpers";
import download from "./services/download";

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

const downloadWeatherIcon = async (icon: string) => {
  Logger.log("Downloading weather icon...");
  let file = join(PLEASANTON_ASSETS_PATH, "weather");
  file = await download(icon, file);
  file = relative(ROOT_PATH, file);
  Logger.success("Downloaded weather icon!");

  return file;
};

const getWeather = async () => {
  await mkdir(DATA_PATH, { recursive: true });

  const weather = await fetchWeather();
  weather.icon = await downloadWeatherIcon(weather.icon);

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
