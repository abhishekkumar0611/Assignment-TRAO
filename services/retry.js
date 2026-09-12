function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function withRetry(
  fn,
  options = {}
) {
  const retries = options.retries ?? 3;
  const baseDelay = options.baseDelay ?? 1000;

  let lastError;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt++
  ) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      const delay =
        baseDelay * Math.pow(2, attempt);

      await sleep(delay);
    }
  }

  throw lastError;
}

module.exports = {
  withRetry
};