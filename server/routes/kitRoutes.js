const express = require("express");

const {
  createKit
} = require("../controllers/kitController");

const router =
  express.Router();

router.post(
  "/",
  createKit
);

module.exports = router;