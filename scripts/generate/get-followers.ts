// Environment Variables
import { config } from "dotenv-safe";
config();

// Externals
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { format } from "prettier";
import { writeFile, mkdir } from "fs/promises";

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

  const response = await octokit.users.listFollowersForAuthenticatedUser();
  const followers = response.data.filter(
    (f): f is ResponseFollower => f !== null
  );
  const data: Follower[] = await Promise.all(followers.map(getFollower));

  const formattedData = format(JSON.stringify(data), {
    parser: "json-stringify",
  });

  await writeFile(FOLLOWERS_PATH, formattedData);
};

const getFollower = async (follower: ResponseFollower): Promise<Follower> => {
  const userResponse = await octokit.users.getByUsername({
    username: follower.login,
  });
  const user = userResponse.data;

  return {
    username: user.login as string,
    url: user.html_url as string,
    name: (user.name ?? undefined) as Follower["name"],
  };
};

getFollowers();
