// Externals
import Logger from "@hack4impact/logger";
import vanillaPuppeteer from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Internals
import { retry } from "./helpers";

class PuppeteerService {
  browser: vanillaPuppeteer.Browser;
  page: vanillaPuppeteer.Page;

  async init() {
    Logger.log("Initializing puppeteer...");
    this.browser = await retry(
      () =>
        puppeteer.use(StealthPlugin()).launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--disable-infobars",
            "--window-position=0,0",
          ],
        }),
      3
    );
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
    Logger.log(`Navigating to '@${acc}' Instagram page...`);

    const page = `https://dumpor.com/v/${acc}`;
    const selector = ".content__img";

    await this.goToPage(page);
    await this.page.waitForSelector(selector);
    await this.page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    Logger.success(`Navigated to '@${acc}' Instagram page!`);

    Logger.log(`Getting ${n} images for '@${acc}'...`);
    const images = await this.page.evaluate(
      (n, selector) => {
        const nodes = document.querySelectorAll<HTMLImageElement>(selector);
        const images = [];

        for (let i = 0; i < n; i++) {
          images.push(nodes[i].src);
        }

        return images;
      },
      n,
      selector
    );
    Logger.success(`Got ${n} images for '@${acc}'!`);

    return images;
  }
}

const puppeteerService = new PuppeteerService();

export default puppeteerService;
