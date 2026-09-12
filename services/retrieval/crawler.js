const {
  fetchPage
} = require("./fetchPage");

const {
  resolveUrl,
  isSameOrigin
} = require("./urlUtils");

const {
  rankLinks
} = require("./linkRanker");
const { withRetry } = require("../retry");

async function crawlCompany(companyUrl) {
  const visited = new Set();
  const pages = [];

  let homepage;

  try {
    homepage = await fetchPage(companyUrl);
  } catch (error) {
    return {
      company: "",
      summary: "",
      what_they_do: "",
      pages_used: [],
      sources: [],
      pages: [],
      error: error.message
    };
  }

  visited.add(companyUrl);
  pages.push(homepage);

  const rankedLinks = rankLinks(
    homepage.links
  );

  // Keep the crawl intentionally small.
  const candidates = rankedLinks.slice(0, 8);

  for (const link of candidates) {
    const url = resolveUrl(
      companyUrl,
      link.href
    );

    if (!url) continue;

    if (!isSameOrigin(companyUrl, url)) {
      continue;
    }

    if (visited.has(url)) {
      continue;
    }

    visited.add(url);

    try {
      const page = await withRetry( () => fetchPage(url), {
        retries: 2,
        baseDelay: 100
      })

      pages.push(page);
    } catch (error) {
      // Skip failed sources.
      console.warn(
        `Skipping ${url}: ${error.message}`
      );
    }
  }

  return {
    company: extractCompanyName(homepage),
    summary: homepage.text.slice(0, 1500),
    what_they_do: homepage.text.slice(0, 2000),
    pages_used: pages.map(page => page.url),
    sources: pages.map(page => page.url),
    pages,
    error: null
  };
}

function extractCompanyName(page) {
  return page.title || "";
}

module.exports = {
  crawlCompany
};