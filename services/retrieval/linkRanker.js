const KEYWORDS = {
  hiring: [
    "career",
    "careers",
    "jobs",
    "hiring",
    "join us",
    "work with us",
    "interview",
    "recruiting",
    "recruitment"
  ],

  about: [
    "about",
    "company",
    "who we are"
  ],

  engineering: [
    "engineering",
    "technology",
    "tech",
    "developers",
    "developer",
    "blog"
  ]
};

function scoreLink(link) {
  const value =
    `${link.href} ${link.text}`.toLowerCase();

  let score = 0;

  for (const keyword of KEYWORDS.hiring) {
    if (value.includes(keyword)) score += 5;
  }

  for (const keyword of KEYWORDS.about) {
    if (value.includes(keyword)) score += 3;
  }

  for (const keyword of KEYWORDS.engineering) {
    if (value.includes(keyword)) score += 2;
  }

  return score;
}

function rankLinks(links) {
  return links
    .map(link => ({
      ...link,
      score: scoreLink(link)
    }))
    .filter(link => link.score > 0)
    .sort((a, b) => b.score - a.score);
}

module.exports = {
  rankLinks
};