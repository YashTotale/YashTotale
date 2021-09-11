// Environment Variables
import { config } from "dotenv-safe";
config();

// Externals
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { format } from "prettier";
import { writeFile, mkdir } from "fs/promises";
import Logger from "@hack4impact/logger";

// Internals
import { DATA_PATH, FOLLOWERS_PATH, Follower } from "./constants";

type ResponseFollower = NonNullable<
  RestEndpointMethodTypes["users"]["listFollowersForAuthenticatedUser"]["response"]["data"][number]
>;

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`,
  userAgent: "YashTotale",
});

const getFollowers = async (): Promise<void> => {
  await mkdir(DATA_PATH, { recursive: true });

  Logger.log("Getting followers...");
  const response = await octokit.users.listFollowersForAuthenticatedUser();
  const followers = response.data.filter(
    (f): f is ResponseFollower => f !== null
  );
  const data: Follower[] = followers.map((follower) => ({
    username: follower.login,
    url: follower.html_url,
    name: follower.name ?? undefined,
  }));
  Logger.success("Got followers!");

  Logger.log("Writing followers...");
  const formattedData = format(JSON.stringify(data), {
    parser: "json-stringify",
  });

  await writeFile(FOLLOWERS_PATH, formattedData);
  Logger.success("Wrote followers!");
};

getFollowers();
