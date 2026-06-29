# Document Creator

Rules and templates for creating and maintaining project documentation in the PratapTravels repository.

---

## Purpose

This document defines the standards for creating clear, consistent, and well-maintained documentation. It includes templates for technical specifications, user guides, and API references, with an emphasis on clarity, consistency, and version control.

> **🌐 Bilingual Requirement:** This website supports Hindi and English. Documentation for new features MUST include i18n implementation details. Reference `agents/i18n-guidelines.md` for translation patterns.

---

## 1. Documentation Standards

### General Principles

- **Clarity First** — Write for the reader, not the writer. Avoid jargon unless defined.
- **Consistency** — Use the same formatting, terminology, and structure across all docs.
- **Living Documents** — Documentation must be updated whenever code changes.
- **Version Control** — All documentation changes are committed alongside code changes.
- **Bilingual** — Document the Hindi and English translations for all user-facing features.

### Formatting Rules

- Use Markdown (`.md`) for all documentation files
- Use ATX-style headings (`#`, `##`, `###`)
- Use fenced code blocks with language identifiers (````javascript`, ````json`, ````bash`)
- Use tables for structured data (API endpoints, configuration options)
- Use emoji prefixes for section headers in README files (e.g., `## 📋 Table of Contents`)
- Keep lines under 120 characters where possible

### File Naming

- Use lowercase with hyphens: `architecture-reviewer.md`, `code-reviewer.md`
- Use descriptive names that indicate the document's purpose
- Place documentation in the appropriate directory:
  - Root: `README.md` (project overview)
  - `agents/`: Agent guidelines and review standards
  - `azure-function/`: Backend function documentation

---

## 2. README.md Template

The main README should follow this structure:

```markdown
# [Project Name] [Badge]

[One-paragraph description]

![Badge](shield-url)

---

## 📋 Table of Contents

- [Section Name](#section-name)
- ...

---

## Section Name

[Content]

---

## Tech Stack

| Category | Technology |
| -------- | ---------- |
| Frontend | HTML5, CSS3, JavaScript |

---

## Project Structure

```
project/
├── file1.ext
└── file2.ext
```

---

## Setup & Usage

### Prerequisites

- [Requirement 1]
- [Requirement 2]

### Quick Start

1. Step one
2. Step two

---

## Contact Information

- **Phone:** +91 XXXXX XXXXX
- **Email:** example@email.com
```

---

## 3. API Documentation Template

For documenting Azure Function endpoints:

```markdown
## [Function Name]

[One-paragraph description]

### Function URL

```
https://domain.azurewebsites.net/api/Endpoint?code=<FUNCTION_KEY>
```

### Supported HTTP Methods

| Method | Type | Description |
| ------ | ---- | ----------- |
| **POST** | `type_name` | Description |
| **GET** | `type=name` | Description |

### Request Body (POST)

```json
{
  "field": "value"
}
```

### Expected Response (GET)

```json
{
  "field": "value"
}
```

### CORS

Allowed origins:
- `https://allowed-domain.com`

### Environment Variables

| Variable | Description |
| -------- | ----------- |
| `VAR_NAME` | Description |
```

---

## 4. Feature Documentation Template

For documenting new features:

```markdown
## Feature Name

### How It Works

1. Step-by-step explanation
2. ...

### i18n / Bilingual Support

**Hindi:**
- `data-i18n="feature.title"` → "हिंदी टेक्स्ट"
- `data-i18n="feature.desc"` → "हिंदी विवरण"

**English:**
- `data-i18n="feature.title"` → "English Text"
- `data-i18n="feature.desc"` → "English Description"

**Translation keys added to `js/i18n.js`:**
- `feature.title`
- `feature.desc`
- `feature.btn`

### Data Structure

```json
{
  "field": "value"
}
```

### Configuration

| Setting | Default | Description |
| ------- | ------- | ----------- |
| setting | value | description |

### Known Limitations

- Limitation 1
- Limitation 2
```

---

## 5. Changelog Documentation

When documenting changes, use this format:

```markdown
## [Date] - Version X.Y.Z

### Added
- New feature description (with i18n: Hindi + English translations)

### Changed
- Modification description

### Fixed
- Bug fix description

### Removed
- Removed feature description
```

---

## 6. Documentation Checklist

### For New Features

- [ ] README.md updated with new feature description
- [ ] API endpoints documented (if applicable)
- [ ] Data structures documented with JSON examples
- [ ] Configuration options documented
- [ ] **i18n section** added with Hindi and English translation keys
- [ ] Project structure updated (if new files added)
- [ ] Environment variables documented

### For Bug Fixes

- [ ] Root cause documented in commit message
- [ ] Fix description added to changelog

### For Refactoring

- [ ] Architecture changes documented in `agents/architecture-reviewer.md`
- [ ] Code style changes reflected in `agents/code-reviewer.md`

---

## 7. Documentation Review Process

1. **Author** creates or updates documentation
2. **Reviewer** checks against this template
3. **Reviewer** verifies accuracy against actual code
4. **Author** addresses feedback
5. **Reviewer** approves and merges

### Review Questions

- Is the documentation accurate and up-to-date?
- Is it clear and easy to understand?
- Are code examples correct and runnable?
- Are all API endpoints documented?
- Are configuration options documented?
- Is the project structure accurate?
- **Does the documentation include i18n/bilingual details for user-facing features?**

---

*Last updated: June 2026*
