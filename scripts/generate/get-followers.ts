// Externals
import { format } from "prettier";
import { writeFile, mkdir } from "fs/promises";
import Logger from "@hack4impact/logger";

// Internals
import { DATA_PATH, FOLLOWERS_PATH, Follower } from "./constants";
import githubService from "./services/github";

interface RawFollower {
  login: string;
  url: string;
  name: string | null;
}

const fetchFollowers = async (): Promise<RawFollower[]> => {
  Logger.log("Getting followers...");
  const data = await githubService.graphqlRequest(`
  {
    viewer {
      followers(first:100) {
        nodes {
          name
          login
          url
        }
      }
    }
  }`);

  Logger.success("Got followers!");
  return data.viewer.followers.nodes;
};

const getFollowers = async (): Promise<void> => {
  await mkdir(DATA_PATH, { recursive: true });

  const rawFollowers = await fetchFollowers();
  const followers: Follower[] = rawFollowers.map((f) => {
    const name = f.name ? f.name : `@${f.login}`;
    const encodedName = encodeURI(name).replace("-", "--");

    return {
      name,
      encodedName,
      url: f.url,
    };
  });

  Logger.log("Writing followers...");
  const formattedData = format(JSON.stringify(followers), {
    parser: "json-stringify",
  });

  await writeFile(FOLLOWERS_PATH, formattedData);
  Logger.success("Wrote followers!");
};

getFollowers();
