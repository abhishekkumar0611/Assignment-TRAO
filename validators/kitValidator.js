const VALID_REQUIREMENT_KINDS = [
  "technical",
  "behavioural",
  "domain"
];

const VALID_PRIORITIES = [
  "must",
  "nice"
];

const VALID_CATEGORIES = [
  "technical",
  "behavioural",
  "system-design",
  "company-fit"
];

function validateKit(kit) {
  const errors = [];

  if (!kit) {
    return {
      valid: false,
      errors: ["Kit is required"]
    };
  }

  validateSource(kit, errors);
  validateCompanyBrief(kit, errors);
  validateRole(kit, errors);
  validateQuestions(kit, errors);
  validateFlashcards(kit, errors);
  validateSchedule(kit, errors);

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateSource(kit, errors) {
  if (!kit.source) {
    errors.push("source is required");
    return;
  }

  if (!Number.isInteger(kit.source.jd_chars)) {
    errors.push("source.jd_chars must be an integer");
  }

  if (!Array.isArray(kit.source.pages_used)) {
    errors.push("source.pages_used must be an array");
  }
}

function validateCompanyBrief(kit, errors) {
  if (!kit.company_brief) {
    errors.push("company_brief is required");
    return;
  }

  if (!Array.isArray(kit.company_brief.sources)) {
    errors.push(
      "company_brief.sources must be an array"
    );
  }
}

function validateRole(kit, errors) {
  if (!kit.role) {
    errors.push("role is required");
    return;
  }

  if (!Array.isArray(kit.role.responsibilities)) {
    errors.push(
      "role.responsibilities must be an array"
    );
  }

  if (!Array.isArray(kit.role.requirements)) {
    errors.push(
      "role.requirements must be an array"
    );
    return;
  }

  const ids = new Set();

  for (const requirement of kit.role.requirements) {
    if (!requirement.id) {
      errors.push("Requirement id is required");
      continue;
    }

    if (ids.has(requirement.id)) {
      errors.push(
        `Duplicate requirement id: ${requirement.id}`
      );
    }

    ids.add(requirement.id);

    if (
      !VALID_REQUIREMENT_KINDS.includes(
        requirement.kind
      )
    ) {
      errors.push(
        `Invalid requirement kind: ${requirement.kind}`
      );
    }

    if (
      !VALID_PRIORITIES.includes(
        requirement.priority
      )
    ) {
      errors.push(
        `Invalid requirement priority: ${requirement.priority}`
      );
    }
  }
}

function validateQuestions(kit, errors) {
  if (!Array.isArray(kit.questions)) {
    errors.push("questions must be an array");
    return;
  }

  const requirementIds = new Set(
    kit.role?.requirements?.map(
      requirement => requirement.id
    ) || []
  );

  const questionIds = new Set();

  for (const question of kit.questions) {
    if (!question.id) {
      errors.push("Question id is required");
      continue;
    }

    if (questionIds.has(question.id)) {
      errors.push(
        `Duplicate question id: ${question.id}`
      );
    }

    questionIds.add(question.id);

    if (
      !VALID_CATEGORIES.includes(
        question.category
      )
    ) {
      errors.push(
        `Invalid question category: ${question.category}`
      );
    }

    if (
      !Number.isInteger(question.difficulty) ||
      question.difficulty < 1 ||
      question.difficulty > 3
    ) {
      errors.push(
        `Invalid difficulty for ${question.id}`
      );
    }

    for (
      const requirementId
      of question.requirement_ids || []
    ) {
      if (!requirementIds.has(requirementId)) {
        errors.push(
          `${question.id} references unknown requirement ${requirementId}`
        );
      }
    }
  }
}

function validateFlashcards(kit, errors) {
  if (!Array.isArray(kit.flashcards)) {
    errors.push(
      "flashcards must be an array"
    );
  }
}

function validateSchedule(kit, errors) {
  const schedule = kit.schedule;

  if (!schedule) {
    errors.push("schedule is required");
    return;
  }

  if (
    !Number.isInteger(schedule.days_available)
  ) {
    errors.push(
      "days_available must be an integer"
    );
  }

  if (!Array.isArray(schedule.days)) {
    errors.push(
      "schedule.days must be an array"
    );
    return;
  }

  if (
    schedule.days.length !==
    schedule.days_available
  ) {
    errors.push(
      "Schedule must contain exactly days_available days"
    );
  }

  const questionIds = new Set(
    kit.questions.map(question => question.id)
  );

  for (const day of schedule.days) {
    if (!Number.isInteger(day.minutes)) {
      errors.push(
        `Day ${day.day} minutes must be an integer`
      );
    }

    for (
      const questionId
      of day.question_ids || []
    ) {
      if (!questionIds.has(questionId)) {
        errors.push(
          `Schedule references unknown question ${questionId}`
        );
      }
    }
  }
}

module.exports = {
  validateKit
};