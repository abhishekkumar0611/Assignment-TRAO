const axios = require("axios");
const cheerio = require("cheerio");
const withRetry = require("../retry")

const MAX_PAGE_SIZE = 2 * 1024 * 1024;

async function fetchPage(url) {
  const response = await axios.get(url, {
    timeout: 10000,
    maxContentLength: MAX_PAGE_SIZE,
    maxBodyLength: MAX_PAGE_SIZE,
    headers: {
      "User-Agent": "AI-Interview-Prep/1.0"
    },
    validateStatus: status => status >= 200 && status < 400
  });

  const contentType =
    response.headers["content-type"] || "";

  if (!contentType.includes("text/html")) {
    throw new Error(
      `Unsupported content type: ${contentType}`
    );
  }

  const $ = cheerio.load(response.data);

  $("script, style, noscript, svg").remove();

  const title = $("title").text().trim();

  const text = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const links = [];

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");

    if (!href) return;

    const linkText = $(element)
      .text()
      .replace(/\s+/g, " ")
      .trim();

    links.push({
      href,
      text: linkText
    });
  });

  return {
    url,
    title,
    text,
    links
  };
}

module.exports = {
  fetchPage
};