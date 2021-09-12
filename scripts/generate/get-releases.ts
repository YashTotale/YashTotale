// Externals
import { format } from "prettier";
import { writeFile, mkdir } from "fs/promises";
import Logger from "@hack4impact/logger";

// Internals
import { DATA_PATH, Release, RELEASES_PATH } from "./constants";
import githubService from "./services/github";

const fetchReleases = async (): Promise<any[]> => {
  Logger.log("Fetching releases...");
  const data = await githubService.graphqlRequest(`
  {
    viewer {
      repositories(first: 100, privacy: PUBLIC, orderBy: {field: PUSHED_AT, direction: DESC}, affiliations: [OWNER, ORGANIZATION_MEMBER], isFork: false, isLocked: false) {
        nodes {
          releases(last: 1) {
            nodes {
              url
              tagName
              updatedAt
              name
              isDraft
              isPrerelease
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
  const releases: Release[] = raw.reduce((arr: Release[], repo: any) => {
    if (!repo.releases.nodes.length) return arr;
    const release = repo.releases.nodes[0];

    return [
      ...arr,
      {
        ...release,
        repo: repo.name,
        owner: repo.owner.login,
      },
    ];
  }, []);

  const sorted = releases.sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
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
