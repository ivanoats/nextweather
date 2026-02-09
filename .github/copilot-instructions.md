# Copilot Instructions for Next Weather

## Project Overview

Next Weather is a weather station data application focused on wind and tide information for human-powered watercraft. It displays real-time weather observations to help water sports enthusiasts make informed decisions.

## Tech Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript (strict mode enabled)
- **UI Library**: Chakra UI with Emotion for styling
- **API**: Next.js API routes
- **Testing**: Jest with Testing Library, Cypress for E2E
- **Code Quality**: ESLint, Prettier
- **Deployment**: Netlify

## Project Structure

```
src/
├── pages/
│   ├── _app.tsx          # Next.js app wrapper
│   ├── index.tsx         # Home page
│   └── api/              # API routes
│       ├── csv.ts        # CSV data endpoint
│       ├── observations.js
│       └── tsv.js
└── util/                 # Utility functions
    ├── convert.ts        # Data conversion utilities
    ├── leading-zero.ts   # Formatting utilities
    └── nws-date-to-js-date.ts
```

## Development Workflow

### Common Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production bundle
- `npm test` - Run Jest tests
- `npm run lint` - Lint code with ESLint
- `npm run storybook` - Start Storybook on port 6006

### Code Style

- Use TypeScript for all new files
- Follow ESLint rules (extends Next.js, TypeScript, and Prettier)
- Use Prettier for formatting
- Prefer functional components with hooks
- Use strict TypeScript compiler options

### Testing

- Unit tests: Jest with Testing Library
- E2E tests: Cypress
- Test files location: `tests/` directory or co-located `*.test.ts(x)` files
- Use `npm test` to run unit tests

## API Guidelines

- API routes are in `src/pages/api/`
- Support CSV and TSV formats for weather data
- Handle data from National Weather Service (NWS)
- Use utility functions from `src/util/` for data transformation

## Key Considerations

1. **Weather Data Handling**: The app processes weather observations with focus on wind and tide data
2. **Date Formatting**: Use `nws-date-to-js-date.ts` for converting NWS date formats
3. **Data Conversion**: Use `convert.ts` utilities for weather data transformations
4. **TypeScript Strict Mode**: All code must pass strict TypeScript checks
5. **Next.js Best Practices**: Follow Next.js conventions for pages and API routes

## When Making Changes

- Always run TypeScript compiler checks
- Run tests before committing
- Follow existing code patterns and file organization
- Update tests when adding new features
- Ensure changes work with the existing Chakra UI theme
- Test API endpoints manually with sample weather data

## Common Tasks

### Adding a New Page
1. Create file in `src/pages/`
2. Use TypeScript (.tsx extension)
3. Follow existing page structure with Head component
4. Add tests in `tests/pages/`

### Adding a New API Endpoint
1. Create file in `src/pages/api/`
2. Export default request handler function
3. Handle both success and error cases
4. Add tests in `tests/pages/api/`

### Adding a Utility Function
1. Create file in `src/util/`
2. Export pure functions when possible
3. Add comprehensive tests
4. Use TypeScript for type safety
