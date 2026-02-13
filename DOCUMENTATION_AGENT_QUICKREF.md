# Documentation Agent Quick Reference

## TL;DR - Getting Started

1. **Create** `.github/copilot-instructions.md` in your repository
2. **Use** the [DOCUMENTATION_AGENT_TEMPLATE.md](DOCUMENTATION_AGENT_TEMPLATE.md) as a starting point
3. **Fill in** project-specific details
4. **Test** with GitHub Copilot to verify it improves code suggestions
5. **Update** as your project evolves

## Essential Sections

Every documentation agent should have:

```markdown
## Project Overview
[What the project does and who it's for]

## Core Architecture
[Directory structure and component organization]

## Technology Stack Specifics
[Frameworks, libraries, versions, configurations]

## Development Workflows
[Commands, testing, deployment]

## Code Patterns & Conventions
[Project-specific patterns and standards]
```

## Quick Tips

### ✅ Do This

- Include **specific version numbers** (e.g., "Next.js 16 with Pages Router")
- Document **why** decisions were made, not just what they are
- Show **real code examples** from your project
- Keep documentation **current** with your codebase
- Use **tables** for structured information
- Add **inline comments** to code examples explaining key parts

### ❌ Avoid This

- Generic descriptions without specifics (e.g., "Uses Next.js")
- Outdated information that doesn't match current code
- Abstract explanations without concrete examples
- Excessive length without clear organization
- Missing version information for dependencies

## Content Structure Pattern

For each major component or pattern:

```markdown
### [Pattern Name] (\`/path/to/file.ext\`)

[Brief description of what it does and why it's important]

\`\`\`[language]
// Example code showing the pattern
const example = implementation();
\`\`\`

**Key Functions/Components:**

- \`name1()\`: [What it does]
- \`name2()\`: [What it does]

**Important Parameters/Config:**

- \`param1\`: [Description] (default: 'value')
```

## Common Sections Template

### Project Overview (Required)

```markdown
## Project Overview

[Name] is a [type] application focused on [purpose].
The app [key functionality] for [users]. [Notable detail].
```

### Architecture (Required)

```markdown
## Core Architecture

### Application Structure

\`\`\`text
src/
├── feature/
│   ├── file.ext    # Description
\`\`\`
```

### Tech Stack (Required)

```markdown
### Technology Stack Specifics

- **Framework**: [Name] [version] with [config]
- **Language**: [Primary] + [Secondary]: [pattern]
- **Testing**: [Tool] [version] with [utilities]
```

### Commands (Required)

```markdown
### Critical Commands

\`\`\`bash
command1          # Description
command2          # Description
\`\`\`
```

### Code Style (Recommended)

```markdown
### Code Style

- **TypeScript** for all new source files
- **Prettier** for formatting
- **ESLint** with [configs]
```

### Data Types (If Applicable)

```markdown
## Data Types

### [API Name] Types

\`\`\`typescript
type TypeName = {
  property?: type;  // Description
};
\`\`\`
```

## Real Example Snippets

### Good Project Overview

```markdown
NextWeather is a specialized weather station data aggregator focused on wind and tide
conditions for human-powered watercraft — kayakers, sailors, and paddleboarders. The app
consolidates data from multiple NOAA APIs into a single, glanceable interface. Data
refreshes automatically every 5 minutes.
```

**Why it's good:**

- States what it is (weather aggregator)
- Identifies target users (kayakers, sailors, paddleboarders)
- Explains key value prop (consolidates multiple APIs)
- Includes important technical detail (5-minute refresh)

### Good Pattern Documentation

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

**Why it's good:**

- Names the pattern clearly
- Shows actual code
- Explains the benefit/reasoning

### Good Technology Stack Documentation

```markdown
- **Next.js 16** with Pages Router (not App Router)
- **React 19** with **Chakra UI v3** (uses \`ChakraProvider\` with \`defaultSystem\`)
  and **Framer Motion** for animations
- **TypeScript + JavaScript**: Mixed usage, with \`.ts\` for new features, \`.js\`
  for legacy endpoints
```

**Why it's good:**

- Specific version numbers
- Important configuration details (Pages Router, not App Router)
- Clarifies mixed language usage pattern

## Testing Your Documentation

### Manual Tests

1. **Ask Copilot about your project**: "How do I add a new feature?"
2. **Request code generation**: "Create a new component following project patterns"
3. **Check suggestions**: Do they match your documented conventions?

### Validation Checklist

- [ ] All version numbers are current
- [ ] Code examples compile/run
- [ ] File paths match actual structure
- [ ] Commands work as documented
- [ ] No broken external links
- [ ] Markdown linter passes (if configured)

## Maintenance Schedule

- **After major refactoring**: Update architecture and patterns
- **When adding new dependencies**: Update tech stack section
- **Quarterly**: Review for accuracy and completeness
- **When onboarding**: Get feedback on clarity and usefulness

## File Location

**Standard location for GitHub Copilot:**

```text
.github/copilot-instructions.md
```

This location is automatically detected and used by GitHub Copilot.

## Markdown Best Practices

- Use `#` for main title, `##` for sections, `###` for subsections
- Use **bold** for emphasis on key terms
- Use inline code with backticks for code elements: `functionName()`
- Use code blocks with language identifiers for examples
- Use tables for structured data
- Keep lines under 120 characters (excluding code blocks and tables)
- Use bullet lists for features and items
- Use numbered lists for sequential steps

## Additional Resources

- **Full Guide**: [DOCUMENTATION_AGENT_GUIDE.md](DOCUMENTATION_AGENT_GUIDE.md)
- **Template**: [DOCUMENTATION_AGENT_TEMPLATE.md](DOCUMENTATION_AGENT_TEMPLATE.md)
- **Example**: `.github/copilot-instructions.md` (in this repo)

## Quick Example

Here's a minimal but complete documentation agent:

```markdown
# GitHub Copilot Instructions for MyApp

## Project Overview

MyApp is a task management application for teams. Built with React and Node.js,
it syncs tasks across devices in real-time using WebSockets.

## Core Architecture

\`\`\`text
src/
├── client/         # React frontend
├── server/         # Express API
└── shared/         # Shared types
\`\`\`

### Technology Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js 20 with Express
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest + React Testing Library

## Development

\`\`\`bash
npm run dev         # Start dev servers
npm test            # Run tests
npm run build       # Production build
\`\`\`

## Code Conventions

- TypeScript for all new code
- Use Prisma for database queries
- REST API follows `/api/v1/[resource]` pattern
- React components use functional style with hooks
```

**This minimal example covers:**

- What the app does
- Basic structure
- Key technologies with versions
- Essential commands
- Main conventions

You can expand from here as your project grows.
