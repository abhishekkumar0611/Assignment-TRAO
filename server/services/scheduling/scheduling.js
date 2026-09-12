function buildSchedule(
  questions,
  requirements,
  daysAvailable
) {
  if (
    !Number.isInteger(daysAvailable) ||
    daysAvailable < 1
  ) {
    throw new Error(
      "days must be a positive integer"
    );
  }

  const ordered = [...questions].sort(
    (a, b) => {
      const aPriority =
        getPriority(a, requirements);

      const bPriority =
        getPriority(b, requirements);

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return b.difficulty - a.difficulty;
    }
  );

  const days = Array.from(
    { length: daysAvailable },
    (_, index) => ({
      day: index + 1,
      focus: "",
      question_ids: [],
      minutes: 0
    })
  );

  ordered.forEach((question, index) => {
    const day =
      days[index % daysAvailable];

    day.question_ids.push(question.id);

    day.minutes +=
      question.difficulty === 3
        ? 30
        : question.difficulty === 2
          ? 20
          : 15;
  });

  days.forEach(day => {
    day.focus =
      `Interview preparation - Day ${day.day}`;
  });

  return {
    days_available: daysAvailable,
    days
  };
}

function getPriority(
  question,
  requirements
) {
  return Math.max(
    ...(question.requirement_ids || [])
      .map(id => {
        const requirement =
          requirements.find(
            item => item.id === id
          );

        return requirement?.priority === "must"
          ? 2
          : 1;
      }),
    0
  );
}

module.exports = {
  buildSchedule
};