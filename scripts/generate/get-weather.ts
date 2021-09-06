// Environment Variables
import { config } from "dotenv-safe";
config();

// Externals
import axios from "axios";
import { format } from "prettier";
import { join, relative } from "path";
import { writeFile, mkdir, readdir } from "fs/promises";

// Internals
import {
  DATA_PATH,
  PLEASANTON_ASSETS_PATH,
  ROOT_PATH,
  Weather,
  WEATHER_PATH,
} from "./constants";

interface RawWeather {
  detailedForecast: string;
  icon: string;
}

const fetchWeather = async (): Promise<RawWeather> => {
  const res = await axios.get(
    "https://api.weather.gov/gridpoints/MTR/102,97/forecast"
  );
  const weather = res.data.properties.periods[0];
  return weather;
};

const getImages = async () => {
  const assets = await readdir(PLEASANTON_ASSETS_PATH);
  return assets.map((asset) =>
    relative(ROOT_PATH, join(PLEASANTON_ASSETS_PATH, asset))
  );
};

const getWeather = async () => {
  await mkdir(DATA_PATH, { recursive: true });

  const [weather, images] = await Promise.all([fetchWeather(), getImages()]);

  const data: Weather = {
    forecast: weather.detailedForecast,
    images,
    icon: weather.icon,
  };
  const formattedData = format(JSON.stringify(data), {
    parser: "json-stringify",
  });

  await writeFile(WEATHER_PATH, formattedData);
};

getWeather();
