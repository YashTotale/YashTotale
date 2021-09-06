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
  INSTAGRAM_ACCOUNT,
  NUM_INSTA_PICS,
  PLEASANTON_INSTAGRAM_ASSETS_PATH,
  PLEASANTON_STATIC_ASSETS_PATH,
  ROOT_PATH,
  Weather,
  WEATHER_PATH,
} from "./constants";
import puppeteerService from "./services/puppeteer";
import download from "./services/download";

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

const getStaticImages = async () => {
  const assets = await readdir(PLEASANTON_STATIC_ASSETS_PATH);
  return assets.map((asset) =>
    relative(ROOT_PATH, join(PLEASANTON_STATIC_ASSETS_PATH, asset))
  );
};

const getInstagramImages = async () => {
  await mkdir(PLEASANTON_INSTAGRAM_ASSETS_PATH, { recursive: true });
  const images = await puppeteerService.getLatestInstagramPostsFromAccount(
    INSTAGRAM_ACCOUNT,
    NUM_INSTA_PICS
  );
  return Promise.all(
    images.map(async (img, i) => {
      const file = join(PLEASANTON_INSTAGRAM_ASSETS_PATH, i.toString());
      const createdFile = await download(img, file);
      return relative(ROOT_PATH, createdFile);
    })
  );
};

const getWeather = async () => {
  await mkdir(DATA_PATH, { recursive: true });

  const [weather, staticImages, instagramImages] = await Promise.all([
    fetchWeather(),
    getStaticImages(),
    getInstagramImages(),
  ]);

  const data: Weather = {
    forecast: weather.detailedForecast,
    staticImages,
    instagramImages,
    icon: weather.icon,
  };
  const formattedData = format(JSON.stringify(data), {
    parser: "json-stringify",
  });

  await puppeteerService.close();
  await writeFile(WEATHER_PATH, formattedData);
};

getWeather();
