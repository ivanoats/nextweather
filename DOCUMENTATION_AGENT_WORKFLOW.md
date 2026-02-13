# Documentation Agent Workflow

This document provides visual guides for understanding and creating documentation agents.

## How GitHub Copilot Uses Documentation Agents

```mermaid
graph TB
    A[Developer writes code] --> B{GitHub Copilot activated}
    B --> C[Reads .github/copilot-instructions.md]
    C --> D[Understands project context]
    D --> E[Provides context-aware suggestions]
    E --> F[Suggestions match project patterns]
    F --> G[Developer accepts suggestions]
    G --> H[Code follows project conventions]
    
    style C fill:#4CAF50
    style E fill:#2196F3
    style H fill:#4CAF50
```

## Creating a Documentation Agent

```mermaid
graph LR
    A[Start] --> B[Create .github/copilot-instructions.md]
    B --> C[Add Project Overview]
    C --> D[Document Architecture]
    D --> E[List Technologies]
    E --> F[Add Code Patterns]
    F --> G[Include Examples]
    G --> H[Test with Copilot]
    H --> I{Suggestions improved?}
    I -->|Yes| J[Done]
    I -->|No| K[Refine documentation]
    K --> H
    
    style B fill:#4CAF50
    style H fill:#FF9800
    style J fill:#4CAF50
```

## Documentation Agent Structure

```mermaid
graph TD
    A[Documentation Agent] --> B[Project Overview]
    A --> C[Core Architecture]
    A --> D[Technology Stack]
    A --> E[Code Patterns]
    A --> F[Development Workflows]
    
    B --> B1[What the project does]
    B --> B2[Target users]
    B --> B3[Key features]
    
    C --> C1[Directory structure]
    C --> C2[Component organization]
    C --> C3[Data flow]
    
    D --> D1[Frameworks & versions]
    D --> D2[Libraries & config]
    D --> D3[Language patterns]
    
    E --> E1[Common patterns]
    E --> E2[Code examples]
    E --> E3[Error handling]
    
    F --> F1[Commands]
    F --> F2[Testing approach]
    F --> F3[Deployment]
    
    style A fill:#2196F3
    style B fill:#4CAF50
    style C fill:#4CAF50
    style D fill:#4CAF50
    style E fill:#4CAF50
    style F fill:#4CAF50
```

## Documentation Quality Levels

### Level 1: Basic (Minimal but Functional)

```markdown
# Project Instructions

## Overview
[Name] is a [type] app using [tech]. It does [purpose].

## Stack
- Framework: [Name]
- Language: [Name]

## Commands
\`\`\`bash
npm run dev    # Start
npm test       # Test
\`\`\`
```

**Copilot Benefit**: Basic context, generic suggestions

### Level 2: Intermediate (Good Context)

```markdown
# Project Instructions

## Overview
[Detailed description with users and goals]

## Architecture
\`\`\`text
src/
├── feature1/  # Description
└── feature2/  # Description
\`\`\`

## Stack
- Framework: [Name] [version] with [config]
- Language: [Name] + [when to use]

## Patterns
### Error Handling
\`\`\`typescript
// Example pattern
\`\`\`

## Commands
[Comprehensive list]
```

**Copilot Benefit**: Good context, pattern-aware suggestions

### Level 3: Advanced (Comprehensive)

```markdown
# Project Instructions

## Overview
[Detailed with specific use cases and technical details]

## Architecture
[Detailed structure with inline comments]
[Data flow diagrams]
[Integration points]

## Stack
[Versions, configs, and rationale]

## Patterns
[Multiple patterns with examples]
[Helper functions documented]
[Error handling strategies]

## Data Types
[Complete type definitions]

## Development
[Prerequisites, commands, workflows]

## Testing
[Approach, tools, conventions]
```

**Copilot Benefit**: Excellent context, highly accurate project-specific suggestions

## Maintenance Workflow

```mermaid
graph LR
    A[Code changes] --> B{Architecture changed?}
    B -->|Yes| C[Update docs]
    B -->|No| D{New patterns?}
    D -->|Yes| C
    D -->|No| E{Dependency updates?}
    E -->|Yes| C
    E -->|No| F[No doc update needed]
    C --> G[Test with Copilot]
    G --> H[Commit docs with code]
    
    style C fill:#FF9800
    style G fill:#2196F3
    style H fill:#4CAF50
```

## Best Practices Checklist

```mermaid
graph TD
    A[Documentation Agent] --> B{Has specific versions?}
    B -->|Yes| C{Has code examples?}
    B -->|No| X1[❌ Add versions]
    
    C -->|Yes| D{Explains why not just what?}
    C -->|No| X2[❌ Add examples]
    
    D -->|Yes| E{Current with codebase?}
    D -->|No| X3[❌ Add reasoning]
    
    E -->|Yes| F{Tested with Copilot?}
    E -->|No| X4[❌ Update docs]
    
    F -->|Yes| G[✅ Good documentation!]
    F -->|No| X5[❌ Test and refine]
    
    X1 --> A
    X2 --> A
    X3 --> A
    X4 --> A
    X5 --> A
    
    style G fill:#4CAF50
    style X1 fill:#F44336
    style X2 fill:#F44336
    style X3 fill:#F44336
    style X4 fill:#F44336
    style X5 fill:#F44336
```

## Quick Start Visual Guide

```mermaid
timeline
    title Creating Your First Documentation Agent
    Day 1 : Create .github/copilot-instructions.md
          : Add project overview and architecture
          : Document technology stack
    Day 2 : Add code patterns with examples
          : Document development commands
          : Include data types
    Day 3 : Test with GitHub Copilot
          : Refine based on suggestion quality
          : Get team feedback
    Ongoing : Update with architecture changes
            : Add new patterns as they emerge
            : Keep versions current
```

## Impact Comparison

### Before Documentation Agent

```mermaid
graph LR
    A[Developer asks Copilot] --> B[Generic suggestion]
    B --> C[Doesn't match project style]
    C --> D[Developer manually adjusts]
    D --> E[Time wasted]
    
    style B fill:#FF9800
    style C fill:#F44336
    style E fill:#F44336
```

### After Documentation Agent

```mermaid
graph LR
    A[Developer asks Copilot] --> B[Context-aware suggestion]
    B --> C[Matches project patterns]
    C --> D[Developer accepts]
    D --> E[Time saved]
    
    style B fill:#4CAF50
    style C fill:#4CAF50
    style E fill:#4CAF50
```

## Resources

- **Complete Guide**: [DOCUMENTATION_AGENT_GUIDE.md](DOCUMENTATION_AGENT_GUIDE.md)
- **Template**: [DOCUMENTATION_AGENT_TEMPLATE.md](DOCUMENTATION_AGENT_TEMPLATE.md)
- **Quick Reference**: [DOCUMENTATION_AGENT_QUICKREF.md](DOCUMENTATION_AGENT_QUICKREF.md)
- **Example**: `.github/copilot-instructions.md`
