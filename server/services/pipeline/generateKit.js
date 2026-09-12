const {
  extractRequirements
} = require("../generation/requirements");

const {
  generateQuestions
} = require("../generation/questions");

const {
  generateFlashcards
} = require("../generation/flashcards");

const {
  crawlCompany
} = require("../retrieval/crawler");

const {
  searchInterviewProcess
} = require("../retrieval/interviewResearch");

const {
  checkCoverage
} = require("../coverage/coverage");

const {
  buildSchedule
} = require("../scheduling/scheduler");

const {
  validateKit
} = require("../../validators/kitValidator");

async function generateKit({
  jd,
  companyUrl,
  days
}) {
  // -------------------------
  // 1. Extract JD requirements
  // -------------------------

  const role =
    await extractRequirements(jd);

  // -------------------------
  // 2. Research company
  // -------------------------

  const companyResearch =
    await crawlCompany(companyUrl);

  // -------------------------
  // 3. Research interviews
  // -------------------------

  const interviewResearch =
    await searchInterviewProcess({
      company: companyResearch.company,
      role: role.title
    });

  // -------------------------
  // 4. Generate questions
  // -------------------------

  let questions = [];

  for (const requirement of role.requirements) {
    const category =
      requirement.kind === "technical"
        ? "technical"
        : requirement.kind === "behavioural"
          ? "behavioural"
          : "company-fit";

    const generated =
      await generateQuestions({
        requirement,
        companyResearch,
        interviewResearch,
        category
      });

    questions.push(...generated);
  }

  // -------------------------
  // 5. Coverage check
  // -------------------------

  let coverage =
    checkCoverage(
      role.requirements,
      questions
    );

  // -------------------------
  // 6. Second pass
  // -------------------------

  if (
    coverage.uncovered_requirement_ids.length
  ) {
    const gaps =
      role.requirements.filter(
        requirement =>
          coverage.uncovered_requirement_ids
            .includes(requirement.id)
      );

    for (const requirement of gaps) {
      const generated =
        await generateQuestions({
          requirement,
          companyResearch,
          interviewResearch,
          category: "technical"
        });

      questions.push(...generated);
    }

    coverage =
      checkCoverage(
        role.requirements,
        questions
      );
  }

  // -------------------------
  // 7. Flashcards
  // -------------------------

  const flashcards =
    await generateFlashcards({
      questions
    });

  // -------------------------
  // 8. Deterministic schedule
  // -------------------------

  const schedule =
    buildSchedule(
      questions,
      role.requirements,
      days
    );

  // -------------------------
  // 9. Build kit
  // -------------------------

  const kit = {
    source: {
      company: companyResearch.company,
      company_url: companyUrl,
      role: role.title,
      location: role.location || "",
      jd_chars: jd.length,
      researched_at:
        new Date().toISOString(),
      pages_used:
        companyResearch.pages_used
    },

    company_brief: {
      summary:
        companyResearch.summary,

      what_they_do:
        companyResearch.what_they_do,

      sources:
        companyResearch.sources
    },

    role,

    questions,

    flashcards,

    schedule,

    coverage: {
      uncovered_requirement_ids:
        coverage.uncovered_requirement_ids,

      passes:
        coverage.uncovered_requirement_ids
          .length === 0
          ? 2
          : 2
    }
  };

  // -------------------------
  // 10. Validate
  // -------------------------

  const validation =
    validateKit(kit);

  if (!validation.valid) {
    throw new Error(
      `Invalid kit: ${validation.errors.join(
        "; "
      )}`
    );
  }

  return kit;
}

module.exports = {
  generateKit
};