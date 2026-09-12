const {
  generateJson
} = require("./llm");

async function generateQuestions({
  requirement,
  companyResearch,
  interviewResearch,
  category
}) {
  const prompt = `
Generate interview questions for ONE requirement.

Requirement:
${JSON.stringify(requirement)}

Category:
${category}

Company research:
${JSON.stringify(companyResearch)}

Public interview research:
${JSON.stringify(interviewResearch)}

Return JSON only:

[
  {
    "id": "q1",
    "requirement_ids": ["${requirement.id}"],
    "category": "${category}",
    "prompt": "",
    "answer_outline": "",
    "difficulty": 1
  }
]

Difficulty must be 1, 2 or 3.

Do not invent requirements.
`;

  return generateJson(prompt);
}

module.exports = {
  generateQuestions
};