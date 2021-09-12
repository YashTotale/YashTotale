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
  Pictures,
  PICTURES_PATH,
  Projects,
  PROJECTS_PATH,
  README_PATH,
  Release,
  RELEASES_PATH,
  Weather,
  WEATHER_PATH,
} from "./constants";
import { markdownTable } from "./services/markdown";
import { largestArrLength } from "./services/helpers";

const generateReadme = async () => {
  const currentReadme = await readFile(README_PATH, "utf-8");
  const withFollowers = await generateFollowers(currentReadme);
  const withReleases = await generateReleases(withFollowers);
  const withProjects = await generateProjects(withReleases);
  const withWeather = await generateWeather(withProjects);
  const withPictures = await generatePictures(withWeather);
  const withRefresh = await generateRefresh(withPictures);
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
      return `<a href="${follower.url}" title="${name}"><img src="https://img.shields.io/badge/${encodedName}-24292e?style=flat&logo=Github&logoColor=white&link=${follower.url}" alt="${name}" /></a>`;
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
        ? "pre-release"
        : release.isDraft
        ? "draft"
        : null;

      const name = `${
        release.owner !== "YashTotale" ? `${release.owner}/` : ""
      }${release.repo}`;

      const link = `<a href="${
        release.url
      }" target="_blank" title="${name}">${name}@${release.tagName}${
        sup ? `<sup>${sup}</sup>` : ""
      }</a>`;
      const date = moment(release.updatedAt).format("YYYY-MM-DD");

      return `- ${link} - ${date}`;
    })
    .join("\n");

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));

  return `${before}\n${list}\n\n${after}`;
};

const generateProjects = async (src: string) => {
  const START = "<!-- START PROJECTS -->";
  const END = "<!-- END PROJECTS -->";

  const raw = await readFile(PROJECTS_PATH, "utf-8");
  const projects = JSON.parse(raw) as Projects;
  const repos = Object.values(projects);

  const arr = [...new Array(largestArrLength(repos))].map((x, i) =>
    repos.map((projects) => {
      const project = projects[i];
      if (!project) return null;
      return `<a href="https://github.com/${project.owner}/${project.repo}"><img src="https://github-readme-stats.vercel.app/api/pin?username=${project.owner}&repo=${project.repo}&theme=slateorange&title_color=fff" alt="${project.owner}/${project.repo}" title="${project.owner}/${project.repo}" /></a>`;
    })
  );

  const table = markdownTable([Object.keys(projects), ...arr], {
    align: "c",
  });

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));

  return `${before}\n${table}\n${after}`;
};

const generateWeather = async (src: string) => {
  const START = "<!-- START WEATHER -->";
  const END = "<!-- END WEATHER -->";

  const raw = await readFile(WEATHER_PATH, "utf-8");
  const weather = JSON.parse(raw) as Weather;
  const img = `<img src="${weather.icon}" alt="" height="10" />`;

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));

  return `${before}${img} ${weather.forecast}${after}`;
};

const generatePictures = async (src: string) => {
  const START = "<!-- START PICTURES -->";
  const END = "<!-- END PICTURES -->";

  const raw = await readFile(PICTURES_PATH, "utf-8");
  const weather = JSON.parse(raw) as Pictures;

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));

  const staticImages = weather.static
    .map((img) => `<img src="${img}" height="120" />`)
    .join(" ");
  const instagramHeading = `🔽 Below are the last ${NUM_INSTA_PICS} pictures posted by <a href="https://www.instagram.com/${INSTAGRAM_ACCOUNT}/" target="_blank"><img src="assets/instagram.png" width="10"/> @${INSTAGRAM_ACCOUNT}</a>!`;
  const instagramImages = weather.instagram
    .map((img) => `<img src="${img}" height="120" />`)
    .join(" ");

  return `${before}\n${staticImages}\n\n${instagramHeading}\n\n${instagramImages}\n\n${after}`;
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
