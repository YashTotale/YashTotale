// Externals
import puppeteer from "puppeteer";

class PuppeteerService {
  browser: puppeteer.Browser;
  page: puppeteer.Page;

  async init() {
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

  async getLatestInstagramPostsFromAccount(acc: string, n: 3) {
    const page = `https://www.picuki.com/profile/${acc}`;
    await this.goToPage(page);

    await this.page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    await this.page.waitForTimeout(1000);

    const nodes = await this.page.evaluate<() => string[]>(() => {
      const images = document.querySelectorAll(".post-image");
      return [].map.call(images, (img: Record<string, unknown>) => img.src);
    });

    return nodes.slice(0, n);
  }
}

const puppeteerService = new PuppeteerService();

export default puppeteerService;
