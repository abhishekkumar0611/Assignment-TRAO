const {
  generateKit
} = require("../services/pipeline/generateKit");

async function createKit(req, res) {
  try {
    const {
      jd,
      company_url,
      days
    } = req.body;

    if (!jd?.trim()) {
      return res.status(400).json({
        error: {
          code: "INVALID_JD",
          message:
            "Job description is required"
        }
      });
    }

    if (!company_url?.trim()) {
      return res.status(400).json({
        error: {
          code: "INVALID_COMPANY_URL",
          message:
            "Company URL is required"
        }
      });
    }

    if (
      !Number.isInteger(days) ||
      days < 1 ||
      days > 60
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_DAYS",
          message:
            "Days must be between 1 and 60"
        }
      });
    }

    const kit =
      await generateKit({
        jd,
        companyUrl: company_url,
        days
      });

    return res.status(201).json({
      success: true,
      kit
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: {
        code: "KIT_GENERATION_FAILED",
        message: error.message
      }
    });
  }
}

module.exports = {
  createKit
};