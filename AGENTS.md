# Project Development Rules — AGENTS.md

**Scope:** Entire repository.

**Authority:** This repository is the single source of truth for project implementation, documentation, architecture and development progress.

These instructions apply to every AI coding agent and contributor.

## 1. Mandatory Session Initialization

Before any implementation, code modification or technical decision:

1. Read the latest `AGENTS.md` directly from the repository.
2. Follow the mandatory documentation reading order:
   - `docs/HANDOFF.md`
   - `docs/MVP.md`
   - `docs/DECISIONS.md`
   - `docs/DATA_SOURCES.md`
   - `docs/ARCHITECTURE.md`
   - `docs/ROADMAP.md`
   - `docs/BRAINSTORM.md`
3. Check the current `main` branch and recent commits.
4. Review open GitHub Issues and Pull Requests.
5. Inspect the relevant source code and tests.
6. Identify existing implementations, pending work, dependencies and possible conflicts.
7. Determine the smallest safe and testable next change.

Never assume that previous conversations reflect the current repository state.

If GitHub access is unavailable, clearly report that limitation. Never claim to have verified repository state without actually checking it.

## 2. Repository Language

All repository content must be written in English:

- Source code and code comments
- Automated tests
- Documentation
- GitHub Issues and Pull Requests
- Branch names
- Commit messages
- Technical decisions

Conversations with the project owner must be in Portuguese unless requested otherwise.

User-facing application language follows the approved product requirements.

## 3. Mandatory Development Workflow

Every implementation must follow:

**Issue → Branch → Implementation → Tests → Pull Request → Review → Merge → Issue Closure**

### Issues

- Search existing issues before creating new ones.
- Reuse existing issues whenever appropriate.
- Avoid duplicate tasks.
- Every issue must define its objective, scope and acceptance criteria.
- Identify relevant dependencies and known blockers.
- Distinguish completed work from partially completed work.

### Branches

Never commit directly to `main` during planned development.

Create a dedicated branch from the latest appropriate base.

Use these naming conventions:

- `feat/<issue-number>-short-description`
- `fix/<issue-number>-short-description`
- `docs/<issue-number>-short-description`
- `chore/<issue-number>-short-description`

Keep branches focused on one coherent change.

### Implementation

- Respect approved product and architecture decisions.
- Prefer small, incremental changes.
- Reuse existing components and shared utilities.
- Avoid duplicated business logic.
- Do not implement unrelated changes.
- Preserve existing behavior unless a change is explicitly approved.
- Do not invent data or claim unsupported functionality.
- Keep code maintainable, typed and testable where appropriate.

### Tests

Before proposing a merge:

- Execute relevant automated tests.
- Run type checking, linting and build checks where configured.
- Add regression tests for bug fixes.
- Test high-risk logic and relevant edge cases.
- Validate UI changes in relevant screen sizes and interaction states.
- Report tests that could not be executed.
- Never report a test as passing unless it was actually executed successfully.

### Pull Requests

Every Pull Request must include:

- A concise summary of changes
- Related Issue reference
- Implementation details where necessary
- Tests and validation performed
- Known limitations
- Remaining risks
- Documentation changes

Use `Closes #N` only when every acceptance criterion of issue N has been fulfilled.

Use `Part of #N` for partial implementations.

Review the diff and test results before requesting a merge.

### Merge and Deployment

**Merge requires explicit authorization from the project owner.**

**Deployment requires separate explicit authorization from the project owner.**

Authorization to implement does not authorize merge or deployment.

Never enable automatic deployments, create external infrastructure, publish releases or introduce new cloud services without explicit authorization.

After an authorized merge, verify the resulting repository state and correct issue closure.

## 4. Documentation Responsibilities

Documentation must remain concise, accurate, maintainable and free of unnecessary duplication.

### AGENTS.md

Defines mandatory development rules and the required reading order.

### docs/HANDOFF.md

Records:

- Current implementation state
- Most recent relevant changes
- Open blockers
- Active Issues and Pull Requests
- Test or validation gaps
- Recommended next action

Update after meaningful development sessions.

### docs/MVP.md

Defines:

- Approved product scope
- Required features
- Explicit exclusions
- Acceptance criteria
- Definition of done

Do not expand product scope without approval.

### docs/DECISIONS.md

Records approved product and architectural decisions.

Every decision should have:

- Unique identifier
- Status
- Concise description and rationale
- Related Issue or PR when applicable

Use statuses such as `Proposed`, `Accepted`, `Deferred` and `Superseded`.

**A proposal is never an approved decision.**

### docs/DATA_SOURCES.md

Documents external data sources, provenance, validation status, usage restrictions, licences and known limitations.

Never present unverified external data as confirmed.

### docs/ARCHITECTURE.md

Documents actual architecture, component boundaries and interfaces.

Prefer Mermaid C4 Container (L2) and Component (L3) diagrams when useful.

Clearly distinguish implemented components from proposed components.

Do not present a target architecture as an already implemented system.

### docs/ROADMAP.md

Defines project phases, priorities and major milestones.

GitHub Issues remain the authoritative source for execution progress.

Do not duplicate every issue status in the roadmap.

### docs/BRAINSTORM.md

Stores exploratory ideas, alternatives and rejected proposals.

Ideas do not constitute implementation approval.

Move approved decisions into `DECISIONS.md`.

## 5. Documentation Maintenance

After each meaningful change:

- Update `HANDOFF.md` when implementation status or next steps change.
- Update `DECISIONS.md` when a technical or product decision is approved.
- Update `MVP.md` when approved scope or acceptance criteria change.
- Update `DATA_SOURCES.md` when source evidence or validation changes.
- Update `ARCHITECTURE.md` when actual architecture changes.
- Update `ROADMAP.md` when project phases or major milestones change.
- Update GitHub Issues to reflect execution progress.

Only modify documents affected by the change.

Correct outdated statements instead of appending repetitive history.

Never paste entire conversations into documentation.

## 6. Security and Data Integrity

- Never commit credentials, API keys, access tokens or secrets.
- Never include unrelated personal information in project files.
- Respect third-party data licences and attribution.
- Validate external data before production use.
- Never fabricate test evidence, source provenance or implementation status.
- Keep sensitive configuration outside version-controlled source files.
- Require explicit approval for new infrastructure and production integrations.

## 7. Project Continuity

At the start of every new task:

1. Recover current context from GitHub.
2. Check the latest approved decisions.
3. Check active issues and PRs.
4. Identify code that can be reused.
5. Identify relevant tests and dependencies.
6. Avoid conflicting or duplicate implementations.
7. Propose or execute the smallest issue-scoped change.

At the end of meaningful work:

1. Summarize what changed.
2. Record verified test results.
3. Document remaining risks and blockers.
4. Update affected project documentation.
5. Identify the next actionable task.

Never rely exclusively on previous chat history.

## 8. Final Authority

When instructions conflict, prioritize:

1. Explicit project-owner authorization and safety constraints
2. Current repository `AGENTS.md`
3. Approved decisions in `docs/DECISIONS.md`
4. Approved scope in `docs/MVP.md`
5. Actual source code and tests for implemented behavior
6. Live GitHub Issues and Pull Requests for execution status
7. Current handoff and supporting documentation
8. Previous conversations and unapproved proposals

The repository remains the operational source of truth. Do not treat incomplete documentation, speculative ideas or past conversations as proof of implementation.
