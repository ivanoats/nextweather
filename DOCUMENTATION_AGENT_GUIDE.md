# How to Write a Documentation Agent for GitHub Copilot

## Table of Contents

- [Introduction](#introduction)
- [What is a Documentation Agent?](#what-is-a-documentation-agent)
- [File Structure and Location](#file-structure-and-location)
- [Core Components](#core-components)
- [Writing Effective Documentation](#writing-effective-documentation)
- [Best Practices](#best-practices)
- [Real-World Example](#real-world-example)
- [Testing Your Documentation Agent](#testing-your-documentation-agent)
- [Advanced Techniques](#advanced-techniques)

## Introduction

A documentation agent is a specialized instruction file that provides GitHub Copilot with comprehensive
context about your project. It acts as a knowledge base that helps Copilot understand your codebase's
architecture, patterns, and conventions, enabling it to provide more accurate and relevant code
suggestions and assistance.

## What is a Documentation Agent?

A documentation agent for GitHub Copilot is a markdown file (typically named `copilot-instructions.md`)
placed in the `.github/` directory of your repository. This file contains:

- **Project overview and purpose**: What the project does and who it's for
- **Architecture documentation**: How the code is structured and organized
- **Code patterns and conventions**: Coding standards and practices specific to your project
- **Technology stack details**: Frameworks, libraries, and their specific configurations
- **Development workflows**: Common commands, testing approaches, and deployment processes
- **Key implementation details**: Important patterns, data structures, and API specifications

When GitHub Copilot assists with coding in your repository, it reads this documentation to provide
context-aware suggestions that align with your project's standards and architecture.

## File Structure and Location

### Standard Location

Place your documentation agent file at:

```text
.github/copilot-instructions.md
```

This location is recognized by GitHub Copilot and will be automatically loaded when working in
your repository.

### File Format

- **Format**: Markdown (`.md`)
- **Encoding**: UTF-8
- **Line endings**: LF (Unix-style) preferred for consistency

## Core Components

A well-structured documentation agent should include the following sections:

### 1. Project Overview

Start with a clear, concise description of what your project does:

```markdown
## Project Overview

[ProjectName] is a specialized [type] application focused on [primary purpose].
The app [key functionality] for [target users]. [Key technical detail].
```

**Example:**

```markdown
## Project Overview

NextWeather is a specialized weather station data aggregator focused on wind and tide
conditions for human-powered watercraft — kayakers, sailors, and paddleboarders. The app
consolidates data from multiple NOAA APIs into a single, glanceable interface. Data
refreshes automatically every 5 minutes.
```

### 2. Core Architecture

Document your application's structure with a directory tree and component descriptions:

```markdown
## Core Architecture

### Application Structure

\`\`\`text
src/
├── feature1/
│   ├── component1.ts    # Description
│   └── component2.ts    # Description
└── feature2/
    └── component3.ts    # Description
\`\`\`
```

### 3. Technology Stack Specifics

List all major technologies with version numbers and configuration details:

```markdown
### Technology Stack Specifics

- **Framework**: [Name] [version] with [specific configuration]
- **UI Library**: [Name] [version] (uses [key feature])
- **Language**: [Primary language] + [Secondary language]: [usage pattern]
- **Testing**: [Test framework] [version] with [test utilities]
- **Commit Standards**: [Convention tool] for [standard name]
```

### 4. Data Sources & Integration Points

Document external APIs, databases, or services:

```markdown
### Data Sources & Integration Points

- **[Service Name]**: [What data it provides] via [endpoint pattern]
  ([data format] with [retention/caching details])
- **[Service Name 2]**: [Purpose] via [access method]
```

### 5. API Endpoints (if applicable)

Create a table of all API endpoints:

```markdown
### API Endpoints

| Endpoint | Source | Description |
| --- | --- | --- |
| `/api/endpoint1?param=value` | [Service] | [What it returns] |
| `/api/endpoint2?param=value` | [Service] | [What it returns] |
```

### 6. Key Patterns and Implementation Details

Document important code patterns with examples:

```markdown
### API Handler Pattern (\`/path/to/file.ts\`)

[Description of the pattern and why it's used]

\`\`\`typescript
// Example code snippet showing the pattern
const example = await someFunction();
\`\`\`

**Key Helper Functions:**

- \`functionName()\`: [What it does]
- \`anotherFunction()\`: [What it does]

**Key Parameters:**

- \`param1\`: [Description] (default: 'value')
- \`param2\`: [Description] (default: 'value')
```

### 7. Development Workflows

Document commands and processes developers need to know:

```markdown
## Development Workflows

### Prerequisites

- **Tool 1** version.x (matches \`.version-file\`)
- **Tool 2** ≥ version

### Critical Commands

\`\`\`bash
command1          # Description
command2          # Description
command3          # Description
\`\`\`
```

### 8. Code Patterns & Conventions

Specify coding standards and conventions:

```markdown
## Code Patterns & Conventions

### Project Structure

- [Type of files] go in \`path/\`
- [Another type] in \`another-path/\`
- [Third type] in \`yet-another-path/\`

### Code Style

- **Language preference** for [when to use it]
- **Formatter** for formatting
- **Linter** with [config packages]
```

### 9. Testing Approach

Document testing strategies and patterns:

```markdown
## Testing Approach

- [Component type] tested with \`test-library\` using \`specific-config\`
- [What properties/behaviors] are tested
- [Edge cases or special scenarios]
- Tests in \`/path/\` mirror the source structure
```

### 10. Data Types

Document TypeScript types or data structures:

```markdown
## Data Types

### [API/Feature Name] Types

\`\`\`typescript
type TypeName = {
  property1?: type;  // Description or units
  property2?: type;  // Description or units
};
\`\`\`
```

## Writing Effective Documentation

### Use Clear, Concise Language

- Start with the "what" and "why" before the "how"
- Use active voice
- Avoid jargon unless necessary (and define it if you use it)
- Keep paragraphs short and scannable

### Provide Context-Rich Examples

Instead of:

```markdown
Use the convert function for units.
```

Write:

```markdown
### Unit Conversions (\`/src/util/convert.ts\`)

Convert raw API values to user-friendly units:

- \`metersPerSecondToMph()\`: Converts wind speed from NOAA's m/s to MPH
- \`celsiusToFahrenheit()\`: Converts temperature from °C to °F

All wind speeds are converted to MPH before display, and temperatures to Fahrenheit.
```

### Document the "Why" Not Just the "What"

Explain **why** certain patterns or decisions were made:

```markdown
### Error Handling

APIs use error accumulation with \`Promise.allSettled\` for parallel data fetching:

\`\`\`typescript
const [result1, result2, result3] = await Promise.allSettled([...]);
\`\`\`

This pattern ensures partial data availability even when some sources fail,
providing users with whatever data is available rather than failing completely.
```

### Include Practical Examples

Show actual code snippets from your project:

```markdown
### NDBC Data Constants (\`/src/pages/api/nbdc.ts\`)

\`\`\`typescript
const NDBC_COLUMNS = {
  WDIR: 5,   // Wind direction (degrees True)
  WSPD: 6,   // Wind speed (m/s)
  GST: 7,    // Wind gust (m/s)
  ATMP: 13,  // Air temperature (°C)
} as const;
\`\`\`

Column indices for parsing NDBC realtime2 space-delimited data format.
```

## Best Practices

### 1. Keep It Current

- Update the documentation when you make architectural changes
- Review and refresh the documentation regularly
- Include version numbers for dependencies

### 2. Be Specific About Versions and Configurations

Bad:

```markdown
- **Framework**: Next.js
```

Good:

```markdown
- **Next.js 16** with Pages Router (not App Router)
```

### 3. Document Non-Obvious Choices

If you chose a specific approach or library for a reason, document it:

```markdown
### NWS API Requirements (\`/src/pages/api/forecast.ts\`)

The National Weather Service API requires a User-Agent header:

\`\`\`typescript
const NWS_USER_AGENT = 'NextWeather/1.0 (westpointwind.com)';
\`\`\`

All NWS API requests include this header for API compliance and usage tracking.
```

### 4. Use Tables for Structured Information

Tables make information scannable:

```markdown
| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (Pages Router) |
| UI | React 19, Chakra UI v3, Framer Motion |
| Language | TypeScript (new code) / JavaScript (legacy) |
```

### 5. Link to External Documentation

Reference official documentation when relevant:

```markdown
This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced
by commitlint. Use the \`npm run commit\` helper for a guided prompt, or write messages
like:
```

### 6. Document Error Handling Patterns

Show how errors should be handled in your codebase:

```markdown
### Error Handling

APIs use error accumulation with \`Promise.allSettled\` for parallel data fetching:

\`\`\`typescript
const [weatherResult, currentTideResult, nextTidesResult] =
  await Promise.allSettled([...]);

if (weatherResult.status === 'fulfilled') {
  observations = { ...observations, ...weatherResult.value };
} else {
  errors.push(weatherResult.reason);
}
\`\`\`

This pattern ensures partial data availability even when some sources fail.
```

### 7. Highlight Special Requirements

Call out important requirements or gotchas:

```markdown
### CORS Configuration

Manual CORS headers via helper function in API responses:

\`\`\`typescript
const setCorsHeaders = (res: NextApiResponse): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
};
\`\`\`
```

### 8. Document Data Formats

When working with specific data formats, document their structure:

```markdown
- **NDBC Data Parsing**: Space-delimited text parsing with column index constants
  (\`NDBC_COLUMNS\`) for realtime2 format (MM = missing data, handled by \`parseValue()\`
  helper)
```

## Real-World Example

Here's a complete example section from a documentation agent:

```markdown
## Core Architecture

### Application Structure

\`\`\`text
src/
├── pages/
│   ├── index.tsx              # Main dashboard (tabbed UI)
│   ├── _app.tsx               # ChakraProvider + global layout
│   └── api/
│       ├── nbdc.ts            # Wind + tide aggregator (primary endpoint)
│       ├── observations.ts    # NWS station observations proxy
│       └── forecast.ts        # NWS hourly forecast proxy
├── components/
│   ├── TabBar.tsx             # Tab navigation
│   ├── AboutTab.tsx           # About / info panel
│   ├── CustomTab.tsx          # Custom station selector
│   └── ForecastTab.tsx        # Hourly forecast display
└── util/
    ├── convert.ts             # Unit conversions (m/s → mph, °C → °F)
    ├── leading-zero.ts        # Zero-padding for date formatting
    └── nws-date-to-js-date.ts # NOAA date string → JS Date
\`\`\`

### Data Sources & Integration Points

- **NDBC (National Data Buoy Center)**: Wind and temperature data via realtime2 text
  files at \`www.ndbc.noaa.gov/data/realtime2/{station}.txt\` (space-delimited format
  with 45-day history)
- **NOAA Tides & Currents API**: Current tide levels and predictions via
  \`tidesandcurrents.noaa.gov/api/datagetter\`
- **National Weather Service API**: Weather observations and hourly forecasts via
  \`api.weather.gov\`

### Technology Stack Specifics

- **Next.js 16** with Pages Router (not App Router)
- **React 19** with **Chakra UI v3** (uses \`ChakraProvider\` with \`defaultSystem\`) and
  **Framer Motion** for animations
- **TypeScript + JavaScript**: Mixed usage, with \`.ts\` for new features, \`.js\` for
  legacy endpoints
```

This example demonstrates:

- Clear directory structure with inline descriptions
- Specific version numbers and configurations
- External API documentation with endpoints and data formats
- Language usage patterns and rationale

## Testing Your Documentation Agent

### 1. Markdown Linting

If your project uses markdown linting (like `markdownlint`), test your documentation:

```bash
# Check markdown formatting
npm run lint:md

# Or manually with markdownlint-cli2
markdownlint-cli2 .github/copilot-instructions.md
```

### 2. Manual Testing with Copilot

Test your documentation agent by:

1. **Opening your repository in an editor with GitHub Copilot enabled**
2. **Asking Copilot questions about your project**: "How do I add a new API endpoint?"
3. **Requesting code generation**: "Create a new utility function following project conventions"
4. **Reviewing suggestions**: Check if Copilot's suggestions align with your documented patterns

### 3. Validation Checklist

- [ ] All code examples are syntactically correct
- [ ] Version numbers are accurate
- [ ] Links to external resources are valid
- [ ] File paths match your actual project structure
- [ ] Command examples work as documented
- [ ] Type definitions match your actual types

### 4. Peer Review

Have team members review the documentation:

- Does it help them understand the project?
- Are there missing details they frequently ask about?
- Does Copilot provide better suggestions after reading it?

## Advanced Techniques

### 1. Organizing Large Documentation

For large projects, consider organizing your documentation with clear headers and a table of contents:

```markdown
# GitHub Copilot Instructions for [Project Name]

## Table of Contents

- [Project Overview](#project-overview)
- [Core Architecture](#core-architecture)
- [Development Workflows](#development-workflows)
- [API Documentation](#api-documentation)
- [Testing](#testing)

## Project Overview

[Content...]
```

### 2. Using Mermaid Diagrams

Include visual diagrams for complex architectures:

```markdown
### Data Flow

\`\`\`mermaid
graph LR
    API1["External API 1"] --> Handler["API Handler"]
    API2["External API 2"] --> Handler
    Handler --> Frontend["Frontend Component"]
\`\`\`
```

### 3. Documenting Migration Paths

If you're transitioning between technologies:

```markdown
### Technology Stack Specifics

- **TypeScript + JavaScript**: Mixed usage, with \`.ts\` for new features, \`.js\` for
  legacy endpoints

*Note: We're gradually migrating from JavaScript to TypeScript. All new files should be
TypeScript. When modifying JavaScript files, consider converting them to TypeScript if
they require significant changes.*
```

### 4. Environment-Specific Notes

Document different behaviors in different environments:

```markdown
### Development vs Production

- **Development**: Uses mock data for external APIs (set \`USE_MOCK_DATA=true\`)
- **Production**: Connects to real NOAA APIs with caching layer
```

### 5. Troubleshooting Common Issues

Include a troubleshooting section:

```markdown
## Common Issues

### Build fails with "Cannot find module"

This usually means dependencies are out of sync. Run:

\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### API returns 429 (Too Many Requests)

NOAA APIs have rate limits. Wait 60 seconds and try again, or set up caching.
```

### 6. Documenting Custom Tooling

If you have custom scripts or tools:

```markdown
### Custom Scripts

#### \`npm run commit\`

Interactive commit helper using Commitizen. Prompts for:
- Type (feat, fix, docs, etc.)
- Scope (optional)
- Description
- Breaking changes

Automatically formats commit message following Conventional Commits.
```

## Conclusion

A well-written documentation agent transforms GitHub Copilot from a general-purpose coding assistant
into a project-specific expert. By providing clear, comprehensive, and context-rich documentation,
you enable Copilot to:

- Generate code that follows your project's conventions
- Suggest appropriate patterns and practices
- Understand your architecture and dependencies
- Provide relevant examples and implementations

Remember to:

- **Keep it current**: Update as your project evolves
- **Be specific**: Include versions, configurations, and details
- **Show examples**: Real code is more valuable than abstract descriptions
- **Explain why**: Document the reasoning behind decisions
- **Test it**: Verify that Copilot provides better assistance after reading it

With a good documentation agent, your entire team (human and AI) will be more productive and
consistent in their work.
