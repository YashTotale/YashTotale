// Externals
import moment from "moment";
import { format } from "prettier";
import { writeFile, mkdir } from "fs/promises";
import Logger from "@hack4impact/logger";

// Internals
import { DATA_PATH, Release, RELEASES_PATH } from "./constants";
import githubService from "./services/github";

interface RawRelease {
  url: string;
  updatedAt: string;
  tagName: string;
}

interface Repo {
  name: string;
  owner: {
    login: string;
  };
  releases: {
    nodes: RawRelease[];
  };
}

const fetchReleases = async (): Promise<Repo[]> => {
  Logger.log("Fetching releases...");
  const data = await githubService.graphqlRequest(`
  {
    viewer {
      repositories(first: 100, privacy: PUBLIC, orderBy: {field: PUSHED_AT, direction: DESC}, affiliations: [OWNER, ORGANIZATION_MEMBER], isFork: false, isLocked: false) {
        nodes {
          releases(last: 1) {
            nodes {
              url
              updatedAt
              tagName
            }
          }
          owner {
            login
          }
          name
        }
      }
    }
  }`);

  Logger.success("Fetched releases!");
  return data.viewer.repositories.nodes;
};

const formatReleases = (raw: any[]) => {
  Logger.log("Formatting releases...");
  const releases: Release[] = raw.reduce((arr: Release[], repo: Repo) => {
    if (!repo.releases.nodes.length) return arr;

    const rawRelease = repo.releases.nodes[0];
    const owner = repo.owner.login;
    const name = `${owner === "YashTotale" ? "" : `${owner}/`}${repo.name}`;
    const date = moment(rawRelease.updatedAt).format("YYYY-MM-DD");

    return [
      ...arr,
      {
        name,
        url: rawRelease.url,
        date,
        version: rawRelease.tagName,
      },
    ];
  }, [] as Release[]);

  const sorted = releases.sort((a, b) =>
    moment(a.date).isBefore(moment(b.date)) ? 1 : -1
  );

  Logger.success("Formatted releases!");
  return sorted.slice(0, 10);
};

const getReleases = async () => {
  await mkdir(DATA_PATH, { recursive: true });

  const raw = await fetchReleases();
  const releases = formatReleases(raw);
  const formattedData = format(JSON.stringify(releases), {
    parser: "json-stringify",
  });

  Logger.log("Writing releases...");
  await writeFile(RELEASES_PATH, formattedData);
  Logger.success("Wrote releases!");
};

getReleases();
