// Externals
import Logger from "@hack4impact/logger";
import puppeteer from "puppeteer";

class PuppeteerService {
  browser: puppeteer.Browser;
  page: puppeteer.Page;

  async init() {
    Logger.log("Initializing puppeteer...");
    this.browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--incognito",
        "--proxy-server=http=194.67.37.90:3128",
      ],
    });
    Logger.success("Initialized puppeteer!");
  }

  async goToPage(url: string) {
    if (!this.browser) {
      await this.init();
    }
    this.page = await this.browser.newPage();

    await this.page.setExtraHTTPHeaders({
      "Accept-Language": "en-US",
    });

    await this.page.goto(url, {
      waitUntil: "networkidle0",
    });
  }

  async close() {
    await this.page.close();
    await this.browser.close();
  }

  async getLatestInstagramPostsFromAccount(acc: string, n = 3) {
    Logger.log(`Getting ${n} images for '@${acc}'...`);
    const page = `https://www.picuki.com/profile/${acc}`;
    await this.goToPage(page);

    await this.page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    await this.page.waitForTimeout(1000);

    const images = await this.page.evaluate<(n: number) => string[]>((n) => {
      const nodes = document.querySelectorAll<HTMLImageElement>(".post-image");
      const images = [];

      for (let i = 0; i < n; i++) {
        images.push(nodes[i].src);
      }

      return images;
    }, n);

    Logger.success(`Got ${n} images for '@${acc}'!`);
    return images;
  }
}

const puppeteerService = new PuppeteerService();

export default puppeteerService;
