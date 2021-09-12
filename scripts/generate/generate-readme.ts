// Externals
import { readFile, writeFile } from "fs/promises";
import { format } from "prettier";
import moment from "moment";

// Internals
import {
  Follower,
  FOLLOWERS_PATH,
  INSTAGRAM_ACCOUNT,
  NUM_INSTA_PICS,
  README_PATH,
  Release,
  RELEASES_PATH,
  Weather,
  WEATHER_PATH,
} from "./constants";

const generateReadme = async () => {
  const currentReadme = await readFile(README_PATH, "utf-8");
  const withFollowers = await generateFollowers(currentReadme);
  const withReleases = await generateReleases(withFollowers);
  const withWeather = await generateWeather(withReleases);
  const withRefresh = await generateRefresh(withWeather);
  const formatted = format(withRefresh, {
    parser: "markdown",
  });

  await writeFile(README_PATH, formatted);
};

const generateFollowers = async (src: string) => {
  const START = "<!-- START FOLLOWERS -->";
  const END = "<!-- END FOLLOWERS -->";

  const raw = await readFile(FOLLOWERS_PATH, "utf-8");
  const followers = JSON.parse(raw) as Follower[];

  const list = followers
    .map((follower) => {
      const name = follower.name ? follower.name : `@${follower.login}`;
      const encodedName = encodeURI(name).replace("-", "--");
      return `[![${name}](https://img.shields.io/badge/${encodedName}-24292e?style=flat&logo=Github&logoColor=white&link=${follower.url})](${follower.url})`;
    })
    .join(" ");

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));

  return `${before}\n${list}\n${after}`;
};

const generateReleases = async (src: string) => {
  const START = "<!-- START RELEASES -->";
  const END = "<!-- END RELEASES -->";

  const raw = await readFile(RELEASES_PATH, "utf-8");
  const releases = JSON.parse(raw) as Release[];

  const list = releases
    .map((release) => {
      const sup = release.isPrerelease
        ? `pre-release`
        : release.isDraft
        ? "draft"
        : null;

      const link = `<a href="${release.url}" target="_blank">${
        release.owner !== "YashTotale" ? `${release.owner}/` : ""
      }${release.repo}@${release.tagName}${sup ? `<sup>${sup}</sup>` : ""}</a>`;
      const date = moment(release.updatedAt).format("YYYY-MM-DD");

      return `- ${link} - ${date}`;
    })
    .join("\n");

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));

  return `${before}\n${list}\n\n${after}`;
};

const generateWeather = async (src: string) => {
  const START = "<!-- START WEATHER -->";
  const END = "<!-- END WEATHER -->";

  const raw = await readFile(WEATHER_PATH, "utf-8");
  const weather = JSON.parse(raw) as Weather;

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));

  const forecast = `**Current Weather**: ${weather.forecast}`;
  const staticImages = weather.staticImages
    .map((img) => `<img src="${img}" height="120" />`)
    .join(" ");
  const instagramHeading = `🔽 Below are the last ${NUM_INSTA_PICS} pictures posted by <a href="https://www.instagram.com/${INSTAGRAM_ACCOUNT}/" target="_blank"><img src="assets/instagram.png" width="10"/> @${INSTAGRAM_ACCOUNT}</a>!`;
  const instagramImages = weather.instagramImages
    .map((img) => `<img src="${img}" height="120" />`)
    .join(" ");

  return `${before}\n${forecast}\n\n${staticImages}\n\n${instagramHeading}\n\n${instagramImages}\n\n${after}`;
};

const generateRefresh = async (src: string) => {
  const START = "<!-- START REFRESH -->";
  const END = "<!-- END REFRESH -->";

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "America/Los_Angeles",
  });

  return `${before}${date}${after}`;
};

generateReadme();
