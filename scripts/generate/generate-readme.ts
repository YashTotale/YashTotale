// Externals
import { readFile, writeFile } from "fs/promises";
import { format } from "prettier";

// Internals
import {
  Follower,
  FOLLOWERS_PATH,
  README_PATH,
  Weather,
  WEATHER_PATH,
} from "./constants";

const generateReadme = async () => {
  const currentReadme = await readFile(README_PATH, "utf-8");
  const withFollowers = await generateFollowers(currentReadme);
  const withWeather = await generateWeather(withFollowers);
  const withFooter = await generateFooter(withWeather);
  const formatted = format(withFooter, {
    parser: "markdown",
  });

  await writeFile(README_PATH, formatted);
};

const generateFollowers = async (src: string) => {
  const START = "<!-- START FOLLOWERS -->";
  const END = "<!-- END FOLLOWERS -->";

  const raw = await readFile(FOLLOWERS_PATH, "utf-8");
  const followers = JSON.parse(raw) as Follower[];

  const list = followers.reduce((currentStr, f) => {
    const name = f.name ? f.name : `@${f.username}`;
    const followerStr = `[![${name}](https://img.shields.io/badge/-${encodeURI(
      name
    )}-24292e?style=flat&logo=Github&logoColor=white&link=${f.url})](${f.url})`;
    return `${currentStr}${followerStr} `;
  }, "");

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));
  const heading = "## My Followers";
  const append =
    "> Generated from [this script](https://github.com/YashTotale/YashTotale/blob/main/scripts/generate/get-followers.ts). Add yourself by following 🙂";

  return `${before}\n${heading}\n${list}\n\n${append}\n${after}`;
};

const generateWeather = async (src: string) => {
  const START = "<!-- START WEATHER -->";
  const END = "<!-- END WEATHER -->";

  const raw = await readFile(WEATHER_PATH, "utf-8");
  const weather = JSON.parse(raw) as Weather;

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));
  const heading = "## 👋 from Pleasanton, CA";
  const forecast = `**Current Weather**: ${weather.forecast}`;
  const images = weather.images
    .map((img) => `<img src="${img}" height="100" />`)
    .join(" ");

  return `${before}\n${heading}\n${forecast}\n\n${images}\n\n${after}`;
};

const generateFooter = async (src: string) => {
  const START = "<!-- START FOOTER -->";
  const before = src.substring(0, src.indexOf(START) + START.length);
  const divider = "\n---";
  const statement =
    "<p align='center'>This <code>README</code> file is generated <strong>every 3 hours</strong>!</p>";
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "America/Los_Angeles",
  });

  const refresh = `<p align="center">Last refresh: ${date}</p>`;

  return `${before}\n${divider}\n${statement}\n${refresh}`;
};

generateReadme();
