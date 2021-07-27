// Externals
import { readFile, writeFile } from "fs/promises";
import { format } from "prettier";

// Internals
import { Follower, FOLLOWERS_PATH, README_PATH } from "./constants";

const generateReadme = async () => {
  const currentReadme = await readFile(README_PATH, "utf-8");
  const withFollowers = await generateFollowers(currentReadme);
  const formatted = format(withFollowers, {
    parser: "markdown",
  });

  await writeFile(README_PATH, formatted);
};

const generateFollowers = async (src: string) => {
  const START = "<!-- START FOLLOWERS -->";
  const END = "<!-- END FOLLOWERS -->";

  const raw = await readFile(FOLLOWERS_PATH, "utf-8");
  const followers = JSON.parse(raw) as Follower[];

  const list = followers.reduce((currentStr, f) => {
    const name = f.name ? f.name : `@${f.username}`;
    const followerStr = `[![${name}](https://img.shields.io/badge/-${encodeURI(
      name
    )}-24292e?style=flat&logo=Github&logoColor=white&link=${f.url})](${f.url})`;
    return `${currentStr}${followerStr} `;
  }, "");

  const before = src.substring(0, src.indexOf(START) + START.length);
  const after = src.substring(src.indexOf(END));
  const heading = "## My Followers";
  const append =
    "> Generated from [this script](https://github.com/YashTotale/YashTotale/blob/main/scripts/generate/get-followers.ts). Add yourself by following 🙂";

  return `${before}\n${heading}\n${list}\n\n${append}\n${after}`;
};

generateReadme();
