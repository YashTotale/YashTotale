// Externals
import { readFile, writeFile } from "fs/promises";
import { basename, extname } from "path";
import { format } from "prettier";
import Logger from "@hack4impact/logger";
import Mustache from "mustache";

// Internals
import {
  Follower,
  FOLLOWERS_PATH,
  PICTURES_PATH,
  Projects,
  PROJECTS_PATH,
  README_PATH,
  README_TEMPLATE_PATH,
  RELEASES_PATH,
  WEATHER_PATH,
} from "./constants";
import { markdownTable } from "./services/markdown";
import { largestArrLength } from "./services/helpers";

type Promisable<T> = T | Promise<T>;
type ReadmeData = Record<string, any>;
type Generator = (...args: any[]) => Promisable<ReadmeData>;

const generateReadme = async () => {
  Logger.log("Creating README...");
  const [current, ...data] = await Promise.all([
    readFile(README_TEMPLATE_PATH, "utf-8"),
    getFileData(FOLLOWERS_PATH),
    getFileData(RELEASES_PATH),
    getFileData(WEATHER_PATH),
    getFileData(PICTURES_PATH),
    generateProjects(),
    generateDate(),
  ]);

  const dataObj = data.reduce((src, d) => ({ ...src, ...d }), {});
  const final = Mustache.render(current, dataObj);

  Logger.success("Created README!");

  Logger.log("Writing README...");
  const formatted = format(final, {
    parser: "markdown",
  });
  await writeFile(README_PATH, formatted);
  Logger.success("Wrote README!");
};

const getFileData: Generator = async (path: string) => {
  const raw = await readFile(path, "utf-8");
  const name = basename(path, extname(path));
  const data = JSON.parse(raw) as Follower[];

  return { [name]: data };
};

const generateProjects: Generator = async () => {
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

  return { projects: table };
};

const generateDate: Generator = () => {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "America/Los_Angeles",
  });

  return { date };
};

generateReadme();
