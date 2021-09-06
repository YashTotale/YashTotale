// Externals
import { createWriteStream, WriteStream } from "fs";
import { unlink } from "fs/promises";
import { get } from "https";

const download = (src: string, dest: string): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    let file: WriteStream;

    get(src, (res) => {
      let fileName: string;
      if (!file) {
        const ext = getExt(res.headers["content-type"] ?? "");
        fileName = `${dest}${ext}`;
        file = createWriteStream(fileName);
      }

      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(fileName);
      });
    }).on("error", function (err) {
      unlink(dest)
        .then(() => reject(err.message))
        .catch(() => reject(err.message));
    });
  });

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
