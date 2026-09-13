# AI Interview Prep Kit

An AI-powered full-stack application that turns a job description and company website into a personalised interview preparation kit.

The application researches the company, extracts requirements from the job description, generates requirement-specific interview questions, checks requirement coverage, creates flashcards, and distributes preparation material across the number of days available before the interview.

Users can then edit, reorder, add, delete, regenerate, and practise with the generated material.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Architecture](#architecture)
* [Project Structure](#project-structure)
* [Generation Pipeline](#generation-pipeline)
* [Requirement Extraction](#requirement-extraction)
* [Company Research and Retrieval](#company-research-and-retrieval)
* [Interview Research](#interview-research)
* [Question Generation](#question-generation)
* [Coverage and Second Pass](#coverage-and-second-pass)
* [Flashcards](#flashcards)
* [Schedule Allocation](#schedule-allocation)
* [Kit State and Editing](#kit-state-and-editing)
* [Practice Mode](#practice-mode)
* [Authentication and Security](#authentication-and-security)
* [Failure Handling](#failure-handling)
* [Batch Evaluation](#batch-evaluation)
* [API Overview](#api-overview)
* [Environment Variables](#environment-variables)
* [Local Setup](#local-setup)
* [Production Setup](#production-setup)
* [Testing](#testing)
* [Deployment](#deployment)
* [Design Decisions and Trade-offs](#design-decisions-and-trade-offs)
* [Known Limitations](#known-limitations)
* [Assessment Requirement Mapping](#assessment-requirement-mapping)

---

# Project Overview

The goal of this project is to build an application that transforms a job description into a structured interview preparation kit.

The user provides:

1. A job description.
2. The company's website URL.
3. The number of days available before the interview.

The application then performs a sequence of retrieval, extraction, generation, validation, and scheduling operations.

The final kit contains:

* Company brief
* Role breakdown
* Responsibilities
* Structured requirements
* Categorised interview questions
* Answer outlines
* Flashcards
* Day-by-day study schedule
* Requirement coverage information

The application also supports editing and practising with the generated kit.

The implementation deliberately avoids using a single LLM prompt to generate the entire result. Research, extraction, question generation, coverage checking, and scheduling are separate steps.

This follows the assessment requirement that the generation pipeline must respond to information discovered during earlier stages rather than producing the entire kit in one call.

---

# Features

## Authentication

* User registration
* Secure password hashing
* Login
* Logout
* Session handling
* Protected endpoints
* User-specific kit access
* Invalid/expired session handling

Email verification, password reset, and role hierarchies are intentionally not implemented because they are outside the assessment scope.

## Kit Creation

Users can:

* Paste a job description.
* Enter a company website.
* Select the number of preparation days.
* Generate an interview preparation kit.

## Company Research

The application:

* Fetches the company homepage.
* Extracts page text.
* Extracts links.
* Ranks potentially useful links.
* Looks for company/about/hiring/engineering information.
* Follows relative links.
* Skips unavailable pages.
* Records retrieved sources.

The crawler does not depend on fixed paths such as `/careers` or `/jobs`.

The assessment specifically requires crawling and ranking discovered links instead of hard-coding a hiring URL.

## Interview Research

The application also searches public information about the company's interview process.

This information can influence the generated questions and preparation focus.

For example, if public information indicates that a company commonly uses:

* Take-home assignments
* System design
* Behavioural interviews
* Multiple technical rounds

the corresponding preparation material can reflect those findings.

## Question Bank

Questions are generated from individual extracted requirements and categories rather than from the entire job description in a single request.

Supported categories:

* Technical
* Behavioural
* System design
* Company fit

Each question contains references to the requirements it covers.

## Coverage Checking

After the first generation pass, the application compares generated questions against extracted requirements.

If a must-have requirement has no associated question, it is treated as a coverage gap.

The application then generates questions specifically for those missing requirements and checks coverage again.

This makes coverage a deterministic application-level decision rather than something delegated to the LLM.

## Flashcards

Flashcards are generated from the question bank and are linked back to the requirements they support.

Users can practise cards individually and record their confidence.

## Study Schedule

The user provides the number of days available.

The application distributes questions across exactly that number of days.

The schedule considers:

* Requirement priority
* Question difficulty
* Topic coverage
* Available days

Schedule allocation is performed by application code rather than an LLM.

## Editing

Users can:

* Edit questions.
* Edit answer outlines.
* Edit flashcards.
* Edit company brief content.
* Add questions.
* Add flashcards.
* Delete questions.
* Delete flashcards.
* Reorder questions.
* Move questions between categories.
* Regenerate individual sections.

Regeneration is designed to preserve user edits elsewhere in the kit.

## Practice Mode

Practice mode allows users to:

1. View one flashcard at a time.
2. Reveal the answer.
3. Record confidence.
4. See covered and uncovered cards.
5. Prioritise lower-confidence material in later sessions.

---

# Tech Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Frontend         | Next.js                              |
| Styling          | Tailwind CSS                         |
| Backend          | Node.js                              |
| API              | Express.js                           |
| Database         | MongoDB                              |
| Language         | JavaScript                           |
| Retrieval        | HTTP + HTML parsing                  |
| LLM              | `<LLM_PROVIDER>`                     |
| Model            | `<LLM_MODEL>`                        |
| Authentication   | JWT + httpOnly cookie                |
| Deployment       | `<FRONTEND_HOST>` + `<BACKEND_HOST>` |
| Database Hosting | MongoDB Atlas                        |

The chosen stack follows the preferred technology stack specified in the assessment: Next.js, Tailwind CSS, Node.js, Express, MongoDB, JavaScript/TypeScript, and a free-tier LLM provider.

---

# Architecture

The application follows a separated service architecture.

```text
                         ┌─────────────────────┐
                         │      Next.js UI      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Express API      │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                     ▼              ▼              ▼
              Authentication    Kit API       Practice API
                     │              │
                     │              ▼
                     │       Generation Pipeline
                     │              │
                     │     ┌────────┼─────────┐
                     │     │        │         │
                     │     ▼        ▼         ▼
                     │  Retrieval Extraction Generation
                     │     │        │         │
                     │     └────────┼─────────┘
                     │              ▼
                     │       Coverage Check
                     │              │
                     │              ▼
                     │         Second Pass
                     │              │
                     │              ▼
                     │         Scheduling
                     │              │
                     │              ▼
                     │          Validation
                     │              │
                     └──────────────┼──────────────┐
                                    ▼              ▼
                               MongoDB         Practice State
```

The main pipeline is:

```text
Job Description
      │
      ▼
Requirement Extraction
      │
      ▼
Company Website Crawl
      │
      ▼
Public Interview Research
      │
      ▼
Requirement-specific Question Generation
      │
      ▼
Coverage Check
      │
      ├── gaps ──► Second Generation Pass
      │
      ▼
Flashcards
      │
      ▼
Deterministic Schedule
      │
      ▼
Structure Validation
      │
      ▼
MongoDB
```

Retrieval, extraction, generation, scheduling, and persistence are intentionally kept as separate concerns as required by the assessment.

---

# Project Structure

```text
.
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── dashboard/
│   │   │   ├── kits/
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   └── practice/
│   │   │
│   │   ├── components/
│   │   │   ├── kit/
│   │   │   ├── questions/
│   │   │   ├── flashcards/
│   │   │   └── schedule/
│   │   │
│   │   └── lib/
│   │       └── api.ts
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── kitController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Kit.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── kitRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── retrieval/
│   │   │   │   ├── fetchPage.js
│   │   │   │   ├── urlUtils.js
│   │   │   │   ├── linkRanker.js
│   │   │   │   ├── crawler.js
│   │   │   │   └── interviewResearch.js
│   │   │   │
│   │   │   ├── generation/
│   │   │   │   ├── llm.js
│   │   │   │   ├── requirements.js
│   │   │   │   ├── questions.js
│   │   │   │   └── flashcards.js
│   │   │   │
│   │   │   ├── coverage/
│   │   │   │   └── coverage.js
│   │   │   │
│   │   │   ├── scheduling/
│   │   │   │   └── scheduler.js
│   │   │   │
│   │   │   ├── pipeline/
│   │   │   │   └── generateKit.js
│   │   │   │
│   │   │   └── retry.js
│   │   │
│   │   ├── validators/
│   │   │   └── kitValidator.js
│   │   │
│   │   └── server.js
│   │
│   ├── tests/
│   │   ├── coverage.test.js
│   │   ├── scheduler.test.js
│   │   ├── validator.test.js
│   │   └── crawler.test.js
│   │
│   ├── scripts/
│   │   └── evaluate.js
│   │
│   ├── .env.example
│   └── package.json
│
├── cases.json
└── README.md
```

---

# Generation Pipeline

The pipeline intentionally uses multiple stages.

## Step 1 — Receive the job description

The job description is pasted directly by the user.

The application does not scrape job boards.

This is intentional because the assessment specifies that the job description should be supplied as text rather than fetched from a job board.

## Step 2 — Extract requirements

The LLM receives the job description and returns structured requirements.

Each requirement receives:

* Stable ID
* Text
* Kind
* Priority

Example:

```json
{
  "id": "r1",
  "text": "5+ years with React",
  "kind": "technical",
  "priority": "must"
}
```

Supported requirement kinds:

```text
technical
behavioural
domain
```

Priority:

```text
must
nice
```

The model is instructed not to invent requirements that are not supported by the job description.

This is particularly important because the assessment states that inventing requirements is worse than honestly reporting that a description contains little information.

---

# Requirement Extraction

Requirement extraction is deliberately separate from question generation.

The extraction stage identifies:

* Role title
* Seniority
* Location
* Responsibilities
* Technical requirements
* Behavioural requirements
* Domain requirements
* Must-have requirements
* Nice-to-have requirements

The extracted IDs become the stable references used throughout the rest of the kit.

Example:

```text
r1 → React
r2 → Node.js
r3 → REST APIs
r4 → Mentoring
```

Questions then reference these IDs.

---

# Company Research and Retrieval

The crawler starts from the company URL supplied by the user.

It performs the following operations:

```text
Company URL
    ↓
Fetch homepage
    ↓
Extract clean text
    ↓
Extract links
    ↓
Resolve relative URLs
    ↓
Rank links
    ↓
Fetch high-value links
    ↓
Record successful and failed sources
```

## Link Ranking

The crawler ranks links using semantic URL/text signals.

Examples of useful terms include:

```text
career
careers
jobs
hiring
join us
work with us
interview
recruitment
about
engineering
technology
developer
```

The crawler does not assume that hiring information exists at a known path.

This is important because the assessment explicitly states that hiring information can be located at unexpected paths such as an engineering blog, handbook, or other company pages.

## Relative URLs

Relative URLs are resolved against the current page:

```text
/about
```

becomes:

```text
https://company.com/about
```

This also allows the evaluator's local company sites to work correctly.

## Source Failure

If one page cannot be retrieved:

```text
Fetch page
    ↓
Failure
    ↓
Record source failure
    ↓
Continue with other sources
```

A single unavailable source does not automatically fail the complete kit.

A company with no discoverable hiring page is still capable of producing a valid kit with the available information.

---

# Public Interview Research

After company research, the application searches publicly available information about the company's interview process.

The purpose is to discover information such as:

* Interview stages
* Technical rounds
* Behavioural rounds
* Take-home assignments
* System design rounds
* Typical interview themes

The discovered information is passed into question generation as context.

If no useful public information is found, the application records that no interview-process information was available instead of fabricating it.

---

# Question Generation

Questions are generated per requirement and category.

For example:

```text
Requirement:
"Experience building REST APIs"

Category:
technical
```

may generate questions focused specifically on REST API implementation.

A behavioural requirement such as:

```text
"Mentor junior engineers"
```

is handled as behavioural preparation rather than technical preparation.

This separation is intentional because the assessment expects requirements to influence the question category and generation context.

Each question contains:

```json
{
  "id": "q1",
  "requirement_ids": ["r1"],
  "category": "technical",
  "prompt": "Explain how you would...",
  "answer_outline": "...",
  "difficulty": 2
}
```

Difficulty is restricted to:

```text
1 = easy
2 = medium
3 = hard
```

---

# Coverage and Second Pass

Coverage is checked after the initial question generation.

The application builds a set of requirement IDs referenced by questions.

Example:

```text
Requirements:

r1 ✓
r2 ✓
r3 ✗
r4 ✓
```

The application identifies:

```text
r3
```

as an uncovered requirement.

A second generation pass then specifically generates questions for `r3`.

Coverage is checked again.

The goal is to prevent a final kit from containing an uncovered must-have requirement.

The assessment specifically requires this feedback loop.

The implementation keeps this decision in application code rather than allowing the LLM to decide whether coverage is complete.

---

# Flashcards

Flashcards are generated from the question bank.

Example:

```json
{
  "id": "f1",
  "front": "What is REST?",
  "back": "REST is an architectural style...",
  "requirement_ids": ["r3"]
}
```

The `requirement_ids` field maintains traceability between:

```text
Requirement
    ↓
Question
    ↓
Flashcard
```

This makes it possible to understand which requirements a user has practised.

---

# Schedule Allocation

The schedule is generated deterministically.

The user provides:

```text
days = 5
```

The application creates exactly:

```text
Day 1
Day 2
Day 3
Day 4
Day 5
```

Each day contains:

```json
{
  "day": 1,
  "focus": "...",
  "question_ids": ["q1", "q2"],
  "minutes": 60
}
```

The schedule ensures:

* Number of days equals the requested number.
* Every must-have requirement appears somewhere.
* Higher-priority material is considered earlier.
* Harder questions are considered earlier.
* Durations are integer minutes.

Schedule allocation is deliberately implemented in code rather than delegated to the LLM because it is deterministic arithmetic/allocation.

---

# Kit State and Editing

The generated kit is treated as a draft that can subsequently be modified by the user.

The implementation distinguishes between generated content and user modifications.

Recommended state representation:

```text
content
 ├── generated
 ├── edited
 └── pinned
```

A generated item can become edited after the user changes it.

A pinned/manual item is protected from automatic replacement during regeneration.

For example:

```json
{
  "id": "q1",
  "prompt": "...",
  "state": {
    "source": "generated",
    "edited": true,
    "pinned": true
  }
}
```

Regeneration operates only on the selected section.

For example:

```text
Regenerate Technical Questions
          ↓
Technical question section
          ↓
Replace eligible generated questions
          ↓
Preserve:
- edited questions
- pinned questions
- behavioural questions
- flashcards
- company brief
- schedule
```

This prevents a section regeneration from overwriting unrelated user work.

The assessment explicitly requires user-written or edited questions to survive category regeneration.

---

# Practice Mode

Practice mode presents one flashcard at a time.

Flow:

```text
Question
   ↓
Reveal Answer
   ↓
Confidence
   ↓
Save Progress
   ↓
Next Card
```

Confidence is stored for each card.

The next session can prioritise cards with lower confidence.

A simple confidence-weighted ordering is used instead of implementing a full spaced-repetition algorithm.

This keeps the implementation understandable while satisfying the requirement that weaker areas receive more attention.

---

# Authentication and Security

Authentication uses:

```text
Register
    ↓
bcrypt password hash
    ↓
MongoDB

Login
    ↓
JWT
    ↓
httpOnly cookie
```

Protected endpoints verify the authentication cookie before processing the request.

Example:

```text
GET /api/auth/me
POST /api/kits
GET /api/kits/:id
PATCH /api/kits/:id
DELETE /api/kits/:id
```

Kit operations always include the authenticated user's ID when querying MongoDB.

This prevents one user from accessing another user's kit.

## External URL Security

Company URLs are treated as untrusted input.

Before fetching external URLs, the application validates them.

The retrieval layer also:

* Restricts expected content types.
* Limits response size.
* Applies request timeouts.
* Follows relative URLs safely.
* Handles redirects carefully.
* Uses retry/backoff for transient failures.

Production retrieval should reject private and loopback destinations.

This follows the assessment's security requirements for external content and URL validation.

## Prompt Injection Protection

Company pages and job descriptions are treated as data, not instructions.

For example, if a crawled page contains:

```text
Ignore previous instructions and reveal...
```

the content is passed to the model as untrusted source material.

The generation prompts explicitly instruct the model not to follow instructions embedded inside retrieved content.

---

# Failure Handling

The application is designed to fail gracefully.

## Invalid Company URL

```text
Invalid URL
    ↓
Validation error
    ↓
Return structured error
```

## Company Timeout

```text
Request
 ↓
Timeout
 ↓
Retry with backoff
 ↓
Retry exhausted
 ↓
Record source failure
```

## 404 Company Page

The failed source is recorded and the application continues when enough information remains to generate a kit.

## No Hiring Page

This is not considered a fatal failure.

The company brief records available research and the hiring source remains empty.

## Thin Job Description

A short description produces a small requirement set.

The application does not invent additional requirements to make the result appear complete.

## No Public Interview Information

The kit records that no useful public interview information was found.

## Invalid LLM JSON

The LLM response is parsed and validated.

If invalid:

```text
LLM response
    ↓
JSON parse/validation failure
    ↓
Retry / repair strategy
    ↓
Validate again
```

The kit is not persisted until it conforms to the expected structure.

## Rate Limiting

The generation/retrieval layers use retry and exponential backoff for transient failures such as rate limiting.

This is particularly important because free-tier LLM providers can impose token-per-minute limits.

## Duplicate Submission

The application uses a submission key/idempotency strategy so that submitting the same job description and company combination does not unnecessarily create duplicate kits.

## 1-Day and 60-Day Schedules

The scheduling algorithm accepts the requested number of days and creates exactly that number of schedule entries.

---

# Batch Evaluation

The repository exposes the mandatory batch entry point:

```bash
npm run evaluate -- --input <cases.json> --output <kits.json>
```

Example:

```bash
npm run evaluate -- --input cases.json --output kits.json
```

The batch command:

1. Reads an array of cases.
2. Extracts the case ID.
3. Reads the JD.
4. Reads the company URL.
5. Reads the requested number of days.
6. Runs the same pipeline used by the application.
7. Validates the generated kit.
8. Writes one result per case.
9. Continues if an individual case fails.

The assessment requires this exact command and requires the batch implementation to use the same retrieval, generation, and validation path as the application.

## Input

Example:

```json
[
  {
    "id": "case-01",
    "jd": "Senior Backend Engineer\n\nWe are looking for...",
    "company_url": "http://localhost:8099/acme/",
    "days": 5
  }
]
```

## Output

```json
{
  "version": "1.0",
  "generated_at": "2026-09-01T09:12:44Z",
  "kits": [
    {
      "id": "case-01",
      "status": "ok",
      "kit": {},
      "error": null
    }
  ]
}
```

If a complete kit cannot be generated:

```json
{
  "id": "case-04",
  "status": "failed",
  "kit": null,
  "error": {
    "code": "COMPANY_UNREACHABLE",
    "message": "Company site unreachable after 3 retries."
  }
}
```

A partially researched company is not automatically a failed case. A case is marked failed only when a kit cannot be produced at all.

---

# API Overview

## Authentication

### Register

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
```

### Login

```http
POST /api/auth/login
```

### Current User

```http
GET /api/auth/me
```

### Logout

```http
POST /api/auth/logout
```

---

## Kits

### Create Kit

```http
POST /api/kits
```

Request:

```json
{
  "jd": "Job description...",
  "company_url": "https://company.com",
  "days": 5
}
```

### Get Kit

```http
GET /api/kits/:id
```

### Update Kit

```http
PATCH /api/kits/:id
```

### Delete Kit

```http
DELETE /api/kits/:id
```

---

# Kit Structure

Every generated kit follows the required structure.

```json
{
  "source": {
    "company": "",
    "company_url": "",
    "role": "",
    "location": "",
    "jd_chars": 0,
    "researched_at": "",
    "pages_used": []
  },

  "company_brief": {
    "summary": "",
    "what_they_do": "",
    "sources": []
  },

  "role": {
    "title": "",
    "seniority": "",
    "responsibilities": [],
    "requirements": []
  },

  "questions": [],

  "flashcards": [],

  "schedule": {
    "days_available": 5,
    "days": []
  },

  "coverage": {
    "uncovered_requirement_ids": [],
    "passes": 2
  }
}
```

The field names and core structure follow Appendix A of the assessment. Stable requirement IDs, question references, integer durations, and valid difficulty values are preserved.

---

# Environment Variables

Create:

```text
server/.env
```

Example:

```env
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/ai-interview-prep

JWT_SECRET=<your-secret>

JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000

NODE_ENV=development

LLM_API_KEY=<your-api-key>

LLM_MODEL=<your-model>
```

The actual `.env` file must never be committed to Git.

Create:

```text
server/.env.example
```

with:

```env
PORT=5000

MONGODB_URI=

JWT_SECRET=

JWT_EXPIRES_IN=7d

CLIENT_URL=

NODE_ENV=production

LLM_API_KEY=

LLM_MODEL=
```

Each environment variable should be configured in the deployment platform rather than committed to source control.

---

# Local Setup

## Requirements

Install:

* Node.js
* npm
* MongoDB or MongoDB Atlas account
* Git

## Clone

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

## Backend

```bash
cd server
npm install
```

Create `.env`:

```bash
cp .env.example .env
```

Configure the required environment variables.

Start the development server:

```bash
npm run dev
```

The API should be available at:

```text
http://localhost:5000
```

## Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend should be available at:

```text
http://localhost:3000
```

---

# Batch Evaluation Setup

From the backend directory:

```bash
cd server
npm install
```

Run:

```bash
npm run evaluate -- --input ../cases.json --output ../kits.json
```

Example:

```bash
npm run evaluate -- --input cases.json --output kits.json
```

The command requires the same environment variables documented in `.env.example`.

It should work from a clean clone after the documented installation step, as required by the assessment.

---

# Production Setup

Production uses:

```text
Next.js frontend
       │
       ▼
Express backend
       │
       ▼
MongoDB Atlas
       │
       ├── LLM provider
       │
       └── External company websites
```

Production environment variables are configured in the hosting platforms.

No production secret is stored in GitHub.

---

# Deployment

## Backend

Recommended deployment platform:

```text
<BACKEND_HOST>
```

Configure:

```text
Root Directory:
server

Build Command:
npm install

Start Command:
npm start
```

Set production environment variables:

```env
NODE_ENV=production

MONGODB_URI=<production-mongodb-uri>

JWT_SECRET=<production-secret>

JWT_EXPIRES_IN=7d

CLIENT_URL=<frontend-url>

LLM_API_KEY=<provider-key>

LLM_MODEL=<provider-model>
```

The backend must be publicly reachable.

## Frontend

Deploy the Next.js application using:

```text
<FRONTEND_HOST>
```

Configure the backend API URL using the frontend environment configuration.

Example:

```env
NEXT_PUBLIC_API_URL=<backend-url>
```

The frontend and backend must both be publicly reachable for final submission.

---

# Testing

The most important automated behaviour is tested at the application level.

Tests cover:

## Coverage

```text
Every must-have requirement
        ↓
At least one question reference
```

## Schedule

```text
Requested days
        =
Schedule days
```

and:

```text
Every must-have requirement
        ↓
Appears in scheduled material
```

## Structure Validation

The validator checks:

* Required fields
* Stable IDs
* Requirement references
* Question references
* Valid categories
* Valid requirement kinds
* Valid priorities
* Difficulty range
* Integer minutes
* Schedule references

Run tests with:

```bash
npm test
```

The assessment specifically identifies schedule allocation, coverage checking, and structure validation as the behaviours worth protecting with automated tests.

---

# Design Decisions and Trade-offs

## 1. Multi-stage generation instead of one large prompt

### Decision

The application separates:

```text
Extraction
→ Research
→ Question Generation
→ Coverage
→ Second Pass
→ Flashcards
→ Schedule
```

### Why

A single prompt makes it difficult to verify whether every requirement was covered and makes research context less meaningful.

The assessment explicitly evaluates whether the sequence is genuine.

---

## 2. Deterministic scheduling

The LLM does not decide the schedule.

The application performs the allocation.

### Why

Scheduling is predictable arithmetic and should produce consistent results for the same input.

---

## 3. Deterministic coverage checking

The model generates questions, but application code determines whether requirements are covered.

### Why

This avoids asking the model to judge its own output.

---

## 4. Crawl and rank instead of fixed URLs

The application does not assume:

```text
/careers
/jobs
/about
```

must exist.

Instead:

```text
homepage
→ links
→ ranking
→ relevant pages
```

### Why

Companies organize hiring information differently.

The assessment explicitly requires this approach.

---

## 5. Partial research is valid

If a company has no hiring page, the application does not fabricate one.

Instead it records the available sources and continues.

### Why

The assessment values honest handling of incomplete external data.

---

## 6. User edits are preserved

Regeneration is section-specific.

### Why

Regenerating the entire kit would overwrite useful user customisation.

---

## 7. Retry and backoff

External retrieval and LLM calls can fail transiently.

The application uses bounded retries and backoff.

### Trade-off

More retries improve resilience but increase total execution time.

The implementation therefore uses a bounded retry count rather than retrying indefinitely.

---

# Known Limitations

* Public interview-process information may not exist for every company.
* Some company websites block automated requests.
* JavaScript-heavy websites may expose limited server-rendered content.
* LLM free tiers may impose token or rate limits.
* Search results may contain incomplete or conflicting interview information.
* The quality of generated questions depends partly on the quality of the supplied job description and retrieved sources.
* Practice mode currently uses confidence-based prioritisation rather than a full spaced-repetition algorithm.
* The crawler intentionally limits the number of pages fetched to control execution time and external request volume.

A thin job description or unavailable company information is represented honestly rather than being filled with invented data.

---

# Optional Creative Feature

**Status: `<IMPLEMENTED / NOT IMPLEMENTED>`**

If implemented:

### Feature

`<FEATURE NAME>`

### Problem

`<Explain the actual interview-preparation problem it solves.>`

### Implementation

`<Briefly explain how it works.>`

### Why

`<Explain why this feature was chosen instead of another possible feature.>`

The assessment makes a custom feature optional. If one is included, it should address a real preparation problem rather than being cosmetic.

---

# Assessment Requirement Mapping

| Assessment Requirement         | Implementation                         |
| ------------------------------ | -------------------------------------- |
| Registration/login/logout      | Authentication module                  |
| Protected pages/endpoints      | Authentication middleware              |
| User-specific kits             | `userId` ownership checks              |
| Paste JD                       | Kit creation form                      |
| Company URL                    | Kit creation form                      |
| Multiple roles                 | Batch/file-based input                 |
| Company crawling               | Retrieval crawler                      |
| Discover hiring information    | Link ranking + crawler                 |
| Public interview research      | Interview research service             |
| Skip unavailable sources       | Source-level error handling            |
| Rate limiting/backoff          | Retry service                          |
| Requirement extraction         | Requirement generation service         |
| Clean page retrieval           | Page fetcher + HTML cleaning           |
| Requirement-specific questions | Question generation service            |
| Separate categories            | Technical/behavioural/etc. generation  |
| Coverage check                 | Deterministic coverage service         |
| Second pass                    | Gap-specific generation                |
| Exact kit structure            | Kit validator                          |
| Stable IDs                     | Requirement/question/flashcard IDs     |
| Flashcards                     | Flashcard generation                   |
| Practice mode                  | Confidence tracking                    |
| Deterministic schedule         | Scheduler service                      |
| Exact requested days           | Schedule validation                    |
| Editing                        | Kit editor                             |
| Reordering                     | Client-side ordering                   |
| Add/delete                     | Kit editor                             |
| Section regeneration           | Section-specific generation            |
| Preserve user edits            | Generated/edited/pinned state          |
| Batch command                  | `npm run evaluate`                     |
| Continue after failed case     | Per-case error handling                |
| Five cases within time limit   | Bounded retrieval/retry strategy       |
| Security                       | URL validation, size/type limits, auth |
| Automated tests                | Coverage/schedule/validation tests     |
| Public deployment              | Frontend + backend deployment          |

---

# Submission Checklist

Before submission, verify:

```text
[ ] GitHub repository is accessible
[ ] Complete source code is committed
[ ] Commit history reflects development
[ ] .env is not committed
[ ] .env.example is included
[ ] README is complete
[ ] Frontend is publicly accessible
[ ] Backend is publicly accessible
[ ] MongoDB production database works
[ ] Register works
[ ] Login works
[ ] Logout works
[ ] Protected routes reject signed-out users
[ ] Users cannot access another user's kits
[ ] JD + company URL generates a kit
[ ] Company site is actually crawled
[ ] Hiring information is discovered without hard-coded paths
[ ] Public interview research is attempted
[ ] Failed sources are handled gracefully
[ ] Requirement extraction works
[ ] Questions reference requirement IDs
[ ] Coverage is checked
[ ] Second pass works
[ ] Flashcards work
[ ] Schedule has exactly requested days
[ ] Every must-have is represented
[ ] Editing works
[ ] Reordering works
[ ] Add/delete works
[ ] Section regeneration works
[ ] User edits survive regeneration
[ ] Practice mode works
[ ] Confidence is recorded
[ ] Batch command works
[ ] Batch command uses the same pipeline
[ ] Batch continues after individual failures
[ ] Automated tests pass
```

---

# Required Commands

## Install

```bash
cd server
npm install

cd ../client
npm install
```

## Run Backend

```bash
cd server
npm run dev
```

## Run Frontend

```bash
cd client
npm run dev
```

## Run Tests

```bash
cd server
npm test
```

## Run Batch Evaluation

```bash
cd server
npm run evaluate -- --input <cases.json> --output <kits.json>
```

---

# LLM Configuration

**Provider:** `<LLM_PROVIDER>`

**Model:** `<LLM_MODEL>`

**Free Tier:** `<DESCRIBE FREE TIER USED>`

The LLM is used for:

* Requirement extraction
* Requirement-specific question generation
* Flashcard generation

The following decisions are intentionally performed by application code:

* Requirement coverage
* Coverage-gap detection
* Schedule allocation
* Kit structure validation
* Ownership/access control

This separation keeps deterministic decisions outside the model.

---

# Sources Used

## Company Research

The crawler begins with the company URL supplied by the user and retrieves pages discovered from that site.

The exact pages used for each kit are recorded in:

```text
source.pages_used
```

and:

```text
company_brief.sources
```

## Public Interview Research

Public web sources are used to look for information about the company's interview process.

The application records available sources rather than presenting unsupported claims as facts.

## Assessment Specification

This project was implemented against the supplied **Full-Stack Engineering Assessment — The AI Interview Prep Kit** specification.

The assessment requires the README to document the chosen stack, setup, LLM provider/model, architecture, retrieval approach, sequencing, state representation, schedule allocation, creative feature, and design trade-offs.

---

# Final Architecture Summary

```text
                         USER
                           │
                           ▼
                    ┌─────────────┐
                    │  Next.js UI │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Express API │
                    └──────┬──────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
        Authentication   Kit API     Practice
             │             │
             │             ▼
             │      ┌──────────────┐
             │      │   Pipeline   │
             │      └──────┬───────┘
             │             │
             │     ┌───────┼────────┐
             │     ▼       ▼        ▼
             │  Crawl   Extract   Research
             │     │       │        │
             │     └───────┼────────┘
             │             ▼
             │       Generate Questions
             │             │
             │             ▼
             │       Coverage Check
             │             │
             │          Gap?
             │        ┌────┴────┐
             │       YES       NO
             │        │         │
             │        ▼         │
             │    Second Pass   │
             │        │         │
             │        └────┬────┘
             │             ▼
             │        Flashcards
             │             │
             │             ▼
             │        Schedule
             │             │
             │             ▼
             │         Validation
             │             │
             └─────────────┼─────────────┐
                           ▼             ▼
                        MongoDB       User State
                           │
                           ▼
                    Saved Interview Kit
```

## Philosophy

The application is intentionally designed around one principle:

> **The LLM generates content; the application owns the important decisions.**

The model can extract, generate, and summarise.

The application decides:

* What was actually found.
* Which requirements exist.
* Whether a requirement is covered.
* How many days the schedule contains.
* Which questions belong to which requirement.
* Whether the final structure is valid.
* Whether a user can access a particular kit.

This provides a more predictable and testable system while still using AI where it provides the most value.
## Future Implementations

The following features are planned for future versions of the application:

### 1. Advanced Authentication & User Management

* Google/GitHub OAuth authentication.
* Password reset and email verification.
* User profile and account management.
* Role-based access control for additional user roles.

### 2. Advanced Interview Kit Customization

* Allow users to select specific question categories before generation.
* Customize the number of questions generated.
* Select preparation difficulty levels.
* Allow users to customize preparation time and daily study duration.

### 3. Improved Company Research

* Expand company research across additional public sources.
* Improve source relevance ranking.
* Add more detailed company and technology summaries.
* Cache research results to reduce repeated crawling and API calls.

### 4. Advanced AI Question Generation

* Improve question generation using additional company and role context.
* Generate more personalized follow-up questions.
* Generate role-specific system design and scenario-based questions.
* Improve question difficulty classification.

### 5. Adaptive Interview Preparation

* Track user performance during practice sessions.
* Identify weak areas based on confidence and practice results.
* Automatically recommend questions based on weak requirements.
* Dynamically adjust the preparation plan based on user progress.

### 6. Advanced Flashcard System

* Implement spaced-repetition based revision.
* Track flashcard performance over multiple sessions.
* Automatically prioritize difficult flashcards.
* Provide personalized revision recommendations.

### 7. Mock Interview Mode

* Add a complete mock interview experience.
* Simulate technical, behavioural, and company-specific interviews.
* Provide AI-generated follow-up questions.
* Provide feedback and improvement suggestions after each session.

### 8. Analytics Dashboard

* Track preparation progress.
* Display question completion statistics.
* Track flashcard confidence and revision history.
* Show requirement coverage and weak areas.
* Provide overall preparation progress reports.

### 9. Real-Time Progress Updates

* Show real-time generation progress for long-running kit generation.
* Display individual pipeline stages such as:

  * Requirement extraction
  * Company research
  * Interview research
  * Question generation
  * Coverage checking
  * Flashcard generation
  * Schedule generation

### 10. Scalability Improvements

* Background job processing for kit generation.
* Queue-based processing for batch evaluation.
* Caching for frequently accessed research data.
* Rate limiting and improved API resource management.
* Additional monitoring and logging.

### 11. Additional Testing

* Increase unit and integration test coverage.
* Add end-to-end tests for the complete user workflow.
* Add automated tests for crawler edge cases.
* Add more batch evaluation test cases.
* Add performance and load testing.

### 12. Deployment & Production Improvements

* Add CI/CD pipelines.
* Automated testing during deployment.
* Production monitoring and error tracking.
* Improved logging and observability.
* Automated database backup and recovery strategies.

> These features are planned enhancements and are not part of the current implementation. They may be introduced in future versions based on product requirements and user feedback.
