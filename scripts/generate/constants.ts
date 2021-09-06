// Externals
import { join } from "path";

export interface Follower {
  username: string;
  url: string;
  name?: string;
}

export interface Weather {
  forecast: string;
  images: string[];
  icon: string;
}

export const ROOT_PATH = join(__dirname, "..", "..");
export const README_PATH = join(ROOT_PATH, "README.md");
export const DATA_PATH = join(ROOT_PATH, "data");
export const FOLLOWERS_PATH = join(DATA_PATH, "followers.json");
export const WEATHER_PATH = join(DATA_PATH, "weather.json");
