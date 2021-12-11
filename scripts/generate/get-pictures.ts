// Externals
import { format } from "prettier";
import { join, relative } from "path";
import { writeFile, mkdir, readdir } from "fs/promises";
import Logger from "@hack4impact/logger";

// Internals
import {
  DATA_PATH,
  INSTAGRAM_ACCOUNT,
  NUM_INSTA_PICS,
  Pictures,
  PICTURES_PATH,
  PLEASANTON_INSTAGRAM_ASSETS_PATH,
  PLEASANTON_STATIC_ASSETS_PATH,
  ROOT_PATH,
} from "./constants";
import puppeteerService from "./services/puppeteer";
import download from "./services/download";

const getStaticImages = async () => {
  Logger.log("Fetching static images...");
  const assets = await readdir(PLEASANTON_STATIC_ASSETS_PATH);
  const files = assets.map((asset) =>
    relative(ROOT_PATH, join(PLEASANTON_STATIC_ASSETS_PATH, asset))
  );
  Logger.success("Fetched static images!");

  return files;
};

const getInstagramImages = async () => {
  Logger.log("Fetching instagram images...");

  await mkdir(PLEASANTON_INSTAGRAM_ASSETS_PATH, { recursive: true });
  const images = await puppeteerService.getLatestInstagramPostsFromAccount(
    INSTAGRAM_ACCOUNT,
    NUM_INSTA_PICS
  );
  const files = await Promise.all(
    images.map(async (img, i) => {
      const file = join(PLEASANTON_INSTAGRAM_ASSETS_PATH, (i + 1).toString());
      const createdFile = await download(img, file);
      return relative(ROOT_PATH, createdFile);
    })
  );

  Logger.success("Fetched instagram images!");
  return files;
};

const getPictures = async () => {
  await mkdir(DATA_PATH, { recursive: true });

  const [staticImages, instagram] = await Promise.all([
    getStaticImages(),
    getInstagramImages(),
  ]);

  const data: Pictures = {
    static: staticImages,
    instagram,
    instaAccount: INSTAGRAM_ACCOUNT,
    instaAmount: NUM_INSTA_PICS,
  };

  Logger.log("Writing pictures...");
  const formattedData = format(JSON.stringify(data), {
    parser: "json-stringify",
  });

  await puppeteerService.close();
  await writeFile(PICTURES_PATH, formattedData);
  Logger.success("Wrote pictures!");
};

getPictures();
