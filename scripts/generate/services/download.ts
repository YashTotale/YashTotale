// Externals
import axios from "axios";
import { createWriteStream, WriteStream } from "fs";

const awaitWrite = (w: WriteStream) =>
  new Promise<void>((resolve, reject) => {
    w.on("finish", () => {
      w.close();
      resolve();
    });

    w.on("error", (err) => {
      w.close();
      reject(err);
    });
  });

const download = async (src: string, dest: string): Promise<string> => {
  const res = await axios.get(src, {
    responseType: "stream",
  });
  const ext = getExt(res.headers["content-type"] ?? "");
  const fileName = `${dest}${ext}`;
  const file = createWriteStream(fileName);
  res.data.pipe(file);

  await awaitWrite(file);
  return fileName;
};

const getExt = (type: string) => {
  switch (type) {
    case "image/jpeg":
      return ".jpg";

    case "image/png":
      return ".png";

    case "image/webp":
      return ".webp";

    default:
      throw new Error(`Unsupported Content Type (${type})`);
  }
};

export default download;
