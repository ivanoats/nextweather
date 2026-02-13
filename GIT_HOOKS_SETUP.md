# Git Hooks Setup

This document explains the pre-commit hooks and recommended tools configured for this
project.

## Installed Tools

### 1. **Husky** - Git Hooks Manager

Husky makes managing Git hooks easy. It runs scripts before commits, pushes, and other
Git operations.

### 2. **lint-staged** - Run Linters on Staged Files

Instead of linting all files, lint-staged only runs linters on files you've staged for
commit, making checks much faster.

### 3. **Commitlint** - Enforce Commit Message Conventions

Validates that your commit messages follow the Conventional Commits standard.

## Configured Hooks

### Pre-commit Hook (`.husky/pre-commit`)

Runs **before** every commit:

- ✅ **ESLint** - Fixes and lints staged JavaScript/TypeScript files
- ✅ **Prettier** - Formats staged files
- ✅ **Type Check** - Runs TypeScript compiler to catch type errors

### Commit-msg Hook (`.husky/commit-msg`)

Runs **after** you write your commit message:

- ✅ **Commitlint** - Validates commit message format

### Pre-push Hook (`.husky/pre-push`)

Runs **before** pushing to remote:

- ✅ **Tests** - Runs the entire test suite
- ✅ **Build** - Ensures production build succeeds

## Installation

Run the following command to install all dependencies:

```bash
npm install
```

The `prepare` script will automatically set up husky hooks after installation.

## Usage

### Making a Commit

Just commit as usual. The hooks will run automatically:

```bash
git add .
git commit -m "feat: add new feature"
```

Or use the Commitizen helper:

```bash
npm run commit
```

### What Happens During Commit

1. **Pre-commit**: Lints and formats staged files, then type-checks
2. **Commit-msg**: Validates your commit message format
3. If any check fails, the commit is aborted

### Bypassing Hooks (Emergency Only)

If you absolutely need to bypass hooks:

```bash
git commit --no-verify -m "emergency fix"
```

⚠️ **Use sparingly!** This skips all quality checks.

## Lint-staged Configuration

The `.lintstagedrc.json` file defines what runs on staged files:

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,css}": [
    "prettier --write"
  ]
}
```

## Available Scripts

- `npm run lint` - Lint all files
- `npm run lint-staged` - Lint only staged files (used by pre-commit hook)
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run test suite
- `npm run build` - Build production bundle
- `npm run commit` - Use Commitizen for guided commit messages

## Additional Recommended Tools

### 1. **EditorConfig**

Helps maintain consistent coding styles across different editors.

Create `.editorconfig` file:

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

### 2. **Dependency Management**

- **npm-check-updates** - Keep dependencies up to date

  ```bash
  npx npm-check-updates -u
  ```

- **depcheck** - Find unused dependencies

  ```bash
  npx depcheck
  ```

### 3. **Code Quality**

- **SonarQube/SonarCloud** - Already configured! (`sonar-project.properties`)
- **CodeQL** - GitHub's semantic code analysis (add via GitHub Actions)

### 4. **CI/CD Enhancements**

Consider adding to your CI pipeline:

- **Lighthouse CI** - Performance budgets
- **Bundle analyzer** - Track bundle size
- **Percy** or **Chromatic** - Visual regression testing for Storybook

### 5. **Documentation**

- **TypeDoc** - Generate TypeScript documentation

  ```bash
  npm install --save-dev typedoc
  ```

### 6. **Security**

- **npm audit** - Already available, run with:

  ```bash
  npm audit
  npm audit fix
  ```

- **Snyk** - Already configured! (`.snyk` file exists)

## Customization

### Disable Build on Pre-push

If the build check is too slow for pre-push, edit `.husky/pre-push` and comment out:

```bash
# npm run build || exit 1
```

### Add More Checks to Pre-commit

Edit `.husky/pre-commit` to add more checks. Keep it fast though!

### Adjust Lint-staged Rules

Modify `.lintstagedrc.json` to change what runs on staged files.

## Troubleshooting

### Hooks Not Running

1. **Ensure husky is installed:**

   ```bash
   npm install
   ```

2. **Check hook permissions:**

   ```bash
   chmod +x .husky/pre-commit .husky/commit-msg .husky/pre-push
   ```

### Type Check Fails

If type checking is slow, you can temporarily disable it by editing `.husky/pre-commit`:

```bash
# npm run type-check || exit 1
```

Only do this temporarily! Type checking catches important errors.

### CI/CD Conflicts

Make sure your CI pipeline runs the same checks:

- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`

This ensures code that passes locally will pass in CI.

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverting changes

**Examples:**

```text
feat(api): add tide prediction endpoint
fix(forecast): handle missing wind data
docs: update API documentation
test(nbdc): add tests for data parsing
chore(deps): update dependencies
```

## Best Practices

1. **Commit frequently** - Small, focused commits are easier to review
2. **Write clear commit messages** - Use the Conventional Commits format
3. **Fix hook failures** - Don't bypass hooks without good reason
4. **Keep hooks fast** - Pre-commit should take < 30 seconds
5. **Use pre-push for slow checks** - Tests and builds go here
6. **Review before pushing** - Pre-push is your last safety check

## Integration with VS Code

Install recommended extensions (add to `.vscode/extensions.json`):

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "Orta.vscode-jest",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitizen](http://commitizen.github.io/cz-cli/)
