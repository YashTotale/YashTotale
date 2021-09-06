// Externals
import { join } from "path";

export interface Follower {
  username: string;
  url: string;
  name?: string;
}

export interface Weather {
  forecast: string;
  staticImages: string[];
  instagramImages: string[];
  icon: string;
}

export const INSTAGRAM_ACCOUNT = "visittrivalley";
export const NUM_INSTA_PICS = 3;

export const ROOT_PATH = join(__dirname, "..", "..");
export const README_PATH = join(ROOT_PATH, "README.md");
export const DATA_PATH = join(ROOT_PATH, "data");
export const ASSETS_PATH = join(ROOT_PATH, "assets");
export const PLEASANTON_ASSETS_PATH = join(ASSETS_PATH, "pleasanton");
export const PLEASANTON_STATIC_ASSETS_PATH = join(
  PLEASANTON_ASSETS_PATH,
  "static"
);
export const PLEASANTON_INSTAGRAM_ASSETS_PATH = join(
  PLEASANTON_ASSETS_PATH,
  "instagram"
);
export const FOLLOWERS_PATH = join(DATA_PATH, "followers.json");
export const WEATHER_PATH = join(DATA_PATH, "weather.json");
