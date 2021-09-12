// Externals
import { join } from "path";

export interface Follower {
  login: string;
  url: string;
  name: string | null;
}

export interface Weather {
  forecast: string;
  icon: string;
}

export interface Pictures {
  static: string[];
  instagram: string[];
}

export interface Release {
  repo: string;
  url: string;
  tagName: string;
  updatedAt: string;
  name: string;
  owner: string;
  isDraft: boolean;
  isPrerelease: boolean;
}

export const INSTAGRAM_ACCOUNT = "visittrivalley";
export const NUM_INSTA_PICS = 3;

export const ROOT_PATH = join(__dirname, "..", "..");

export const README_PATH = join(ROOT_PATH, "README.md");

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

export const DATA_PATH = join(ROOT_PATH, "data");
export const FOLLOWERS_PATH = join(DATA_PATH, "followers.json");
export const WEATHER_PATH = join(DATA_PATH, "weather.json");
export const PICTURES_PATH = join(DATA_PATH, "pictures.json");
export const RELEASES_PATH = join(DATA_PATH, "releases.json");
