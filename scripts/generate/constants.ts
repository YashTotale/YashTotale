// Externals
import { join } from "path";

export interface Follower {
  url: string;
  name: string;
  encodedName: string;
}

export interface Weather {
  forecast: string;
  icon: string;
}

export interface Pictures {
  static: string[];
  instagram: string[];
  instaAmount: number;
  instaAccount: string;
}

export interface Release {
  name: string;
  url: string;
  date: string;
  version: string;
}

interface Project {
  owner: string;
  repo: string;
}

export type Projects = Record<string, Project[]>;

export const INSTAGRAM_ACCOUNT = "visittrivalley";
export const NUM_INSTA_PICS = 5;

export const ROOT_PATH = join(__dirname, "..", "..");

export const README_TEMPLATE_PATH = join(ROOT_PATH, "README_TEMPLATE.mustache");
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
export const PROJECTS_PATH = join(DATA_PATH, "projects.json");
