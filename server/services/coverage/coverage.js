function checkCoverage(
  requirements,
  questions
) {
  const covered = new Set();

  for (const question of questions) {
    for (const requirementId of question.requirement_ids || []) {
      covered.add(requirementId);
    }
  }

  const uncovered =
    requirements
      .filter(
        requirement =>
          requirement.priority === "must"
      )
      .filter(
        requirement =>
          !covered.has(requirement.id)
      )
      .map(requirement => requirement.id);

  return {
    uncovered_requirement_ids: uncovered,
    complete: uncovered.length === 0
  };
}

module.exports = {
  checkCoverage
};