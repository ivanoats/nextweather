# GitHub Copilot Instructions for [Project Name]

<!-- This template helps you create a documentation agent for GitHub Copilot -->
<!-- Save this file as .github/copilot-instructions.md in your repository -->
<!-- Replace all [placeholder text] with your project-specific information -->

## Project Overview

[Project Name] is a [type of application] focused on [primary purpose].
The app [key functionality] for [target users]. [Key technical detail or feature].

## Core Architecture

### Application Structure

```text
src/
├── [directory1]/
│   ├── [file1.ext]        # [Description]
│   └── [file2.ext]        # [Description]
└── [directory2]/
    └── [file3.ext]        # [Description]
```

### Data Sources & Integration Points

- **[Service/API Name]**: [What data it provides] via [endpoint or method]
  ([data format] with [retention/caching details])
- **[Database/Service Name 2]**: [Purpose] via [access method]

### API Endpoints

| Endpoint | Source | Description |
| --- | --- | --- |
| `/api/[endpoint1]?[param]=[value]` | [Service] | [What it returns] |
| `/api/[endpoint2]?[param]=[value]` | [Service] | [What it returns] |

### API Handler Pattern (`/path/to/file.ext`)

[Description of common pattern used in your APIs]

```[language]
// Example code snippet showing the pattern
const example = await someFunction();
```

**Key Helper Functions:**

- `functionName()`: [What it does]
- `anotherFunction()`: [What it does]

**Key Parameters/Configuration:**

- `param1`: [Description] (default: '[value]')
- `param2`: [Description] (default: '[value]')

### Technology Stack Specifics

- **Framework**: [Name] [version] with [specific router/config]
- **UI Library**: [Name] [version] (uses [key feature or configuration])
- **Language**: [Primary] + [Secondary]: [usage pattern]
- **Database/ORM**: [Name] [version] with [configuration]
- **Testing**: [Test framework] [version] with [utilities]
- **Commit Standards**: [Tool name] for [standard name]

## Development Workflows

### Prerequisites

- **[Tool 1]** [version].x (matches `.[version-file]`)
- **[Tool 2]** ≥ [version]

### Critical Commands

```bash
[command1]          # [Description - e.g., Development server]
[command2]          # [Description - e.g., Production build]
[command3]          # [Description - e.g., Run tests]
[command4]          # [Description - e.g., Linting]
[command5]          # [Description - e.g., Commit helper]
```

### Build Configuration Notes

- [Important configuration detail 1]
- [Important configuration detail 2]

## Code Patterns & Conventions

### Project Structure

- [Type of files] go in `path/to/directory/`
- [Another type] in `another/path/`
- [Test files] in `test/path/` mirroring the source tree

### Utility Functions (`/src/[utils-dir]/`)

- `[utility1.ext]`: [What it does]
- `[utility2.ext]`: [What it does]
- `[utility3.ext]`: [What it does]

### [Important Constants or Configuration] (`/path/to/file.ext`)

```[language]
const CONSTANTS = {
  KEY1: [value],   // [Description]
  KEY2: [value],   // [Description]
} as const;
```

[Explanation of what these constants are used for]

### [Important API/Library Requirements]

[Any special requirements like headers, authentication, etc.]

```[language]
const REQUIRED_HEADER = '[value]';
```

[Explanation of why this is required]

### Error Handling

[Description of your error handling pattern]

```[language]
// Example of error handling pattern
try {
  const result = await operation();
} catch (error) {
  // Error handling code
}
```

[Explanation of the pattern and benefits]

### [Other Important Pattern - e.g., CORS, Authentication, Caching]

[Description]

```[language]
// Example code showing the pattern
const example = () => {
  // Implementation
};
```

### Code Style

- **[Language]** for [when to use it]
- **[Formatter]** for formatting
- **[Linter]** with [config packages]

### Commit Convention

This project uses [Convention Name](https://link-to-docs) enforced by [tool name].
Use the `[commit command]` helper for a guided prompt, or write messages like:

```text
[type]: [description]
[type]: [description]
[type]: [description]
```

[Additional commit guidelines or branch naming conventions]

## Testing Approach

- [Component/module type] tested with `[test-tool]` using `[specific-config]`
- [What aspects] are tested: [list key aspects]
- [Edge cases or special scenarios to consider]
- Tests in `/[test-path]/` mirror the source structure

## Data Types

### [API/Feature Name] Types

```[language]
type TypeName = {
  property1?: type;     // [Description or units]
  property2?: type;     // [Description or units]
  property3?: type;     // [Description or units]
};

type AnotherType = {
  field1: type;         // [Description]
  field2: type;         // [Description]
};
```

### [Component/Module Name] Types

```[language]
interface InterfaceName {
  prop1: type;          // [Description]
  prop2: type;          // [Description]
}
```

## Features

- **[Feature 1]** — [description of what it does]
- **[Feature 2]** — [description of what it does]
- **[Feature 3]** — [description of what it does]

## Deployment Context

- **[Deployment Platform]**: [Details about deployment]
- **[Environment Details]**: [Runtime environment, resources, etc.]
- **[Target Users/Usage Pattern]**: [Who uses this and how]
- **[Performance Characteristics]**: [Key performance metrics or requirements]

---

## Additional Sections (Optional)

### Common Issues

Document known issues and solutions:

```markdown
### [Issue Name]

[Description of the issue]

**Solution:**

\`\`\`bash
[commands or steps to resolve]
\`\`\`
```

### Migration Notes

If you're transitioning technologies:

```markdown
### [Old Technology] → [New Technology]

We're migrating from [old] to [new]. [Current status and guidelines].

- **New code**: Use [new technology]
- **Existing code**: [Migration strategy]
```

### Environment Variables

```markdown
### Required Environment Variables

- `VAR_NAME`: [Description] (example: `value`)
- `ANOTHER_VAR`: [Description] (example: `value`)
```

### Security Considerations

```markdown
### Authentication

[How authentication works in your app]

### API Keys

[How API keys are managed and where they're stored]
```
