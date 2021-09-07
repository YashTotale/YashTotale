// Environment Variables
import { config } from "dotenv-safe";
config();

// Externals
import axios from "axios";
import { format } from "prettier";
import { writeFile, mkdir } from "fs/promises";

// Internals
import { DATA_PATH, Release, RELEASES_PATH } from "./constants";

const fetchReleases = async (): Promise<any[]> => {
  const { data } = await axios.post(
    "https://api.github.com/graphql",
    {
      query: `{
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
  }`,
    },
    {
      headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}` },
    }
  );

  return data.data.viewer.repositories.nodes;
};

const formatReleases = (raw: any[]) => {
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

  return sorted.slice(0, 10);
};

const getReleases = async () => {
  await mkdir(DATA_PATH, { recursive: true });

  const raw = await fetchReleases();
  const releases = formatReleases(raw);
  const formattedData = format(JSON.stringify(releases), {
    parser: "json-stringify",
  });

  await writeFile(RELEASES_PATH, formattedData);
};

getReleases();
