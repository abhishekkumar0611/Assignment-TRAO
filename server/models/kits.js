const mongoose = require("mongoose");

const kitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    submissionKey: {
      type: String,
      required: true
    },

    source: mongoose.Schema.Types.Mixed,

    company_brief:
      mongoose.Schema.Types.Mixed,

    role:
      mongoose.Schema.Types.Mixed,

    questions: [
      mongoose.Schema.Types.Mixed
    ],

    flashcards: [
      mongoose.Schema.Types.Mixed
    ],

    schedule:
      mongoose.Schema.Types.Mixed,

    coverage:
      mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true
  }
);

kitSchema.index(
  {
    userId: 1,
    submissionKey: 1
  },
  {
    unique: true
  }
);

module.exports =
  mongoose.model("Kit", kitSchema);