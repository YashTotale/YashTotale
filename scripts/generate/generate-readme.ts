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

  const list = followers
    .map((follower) => {
      const name = follower.name ? follower.name : `@${follower.username}`;
      const encodedName = encodeURI(name);
      return `[![${name}](https://img.shields.io/badge/-${encodedName}-24292e?style=flat&logo=Github&logoColor=white&link=${follower.url})](${follower.url})`;
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
  const heading = "## ⛳️ Project Releases";

  return `${before}\n${heading}\n${list}\n${after}`;
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
  const staticImages = weather.staticImages
    .map((img) => `<img src="${img}" height="120" />`)
    .join(" ");
  const instagramHeading = `🔽 Below are the last ${NUM_INSTA_PICS} pictures posted by <a href="https://www.instagram.com/${INSTAGRAM_ACCOUNT}/" target="_blank"><img src="assets/instagram.png" width="10"/> @${INSTAGRAM_ACCOUNT}</a>!`;
  const instagramImages = weather.instagramImages
    .map((img) => `<img src="${img}" height="120" />`)
    .join(" ");

  return `${before}\n${heading}\n${forecast}\n\n${staticImages}\n\n${instagramHeading}\n\n${instagramImages}\n\n${after}`;
};

const generateFooter = async (src: string) => {
  const START = "<!-- START FOOTER -->";
  const before = src.substring(0, src.indexOf(START) + START.length);
  const divider = "\n---";

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "America/Los_Angeles",
  });
  const statement = `<p align='center'>This <code>README</code> file is generated <strong>every 6 hours</strong>!<br>Last refresh: ${date}</p>`;
  const badges = [
    {
      src:
        "https://img.shields.io/github/workflow/status/YashTotale/YashTotale/Integrate?logo=github&logoColor=FFFFFF&labelColor=000000&label=Build&style=flat-square",
      link:
        "https://github.com/YashTotale/YashTotale/actions/workflows/integrate.yml",
    },
    {
      src:
        "https://img.shields.io/github/workflow/status/YashTotale/YashTotale/Generate?logo=github&logoColor=FFFFFF&labelColor=000000&label=Generate&style=flat-square",
      link:
        "https://github.com/YashTotale/YashTotale/actions/workflows/generate.yml",
    },
  ];
  const strBadges = `<p align="center">${badges
    .map(
      (b) => `<a href="${b.link}" target="_blank"><img src="${b.src}" /></a>`
    )
    .join(" ")}</p>`;

  return `${before}\n${divider}\n${statement}\n\n${strBadges}`;
};

generateReadme();
