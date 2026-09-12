async function searchInterviewProcess({
  company,
  role
}) {
  /*
   * Connect this to your chosen search provider.

   * Search for public discussion such as:
   *
   * "<company> interview process"
   * "<company> <role> interview"
   * "<company> interview questions"
   *
   * Return only publicly available information.
   */

  return {
    found: false,
    sources: [],
    summary: ""
  };
}

module.exports = {
  searchInterviewProcess
};