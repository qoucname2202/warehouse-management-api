# Contributing Guide

## Code Style

- Use **ESLint** and **Prettier** (configured in project)
- Run `npm run lint:fix` and `npm run prettier:fix` before committing
- Write comments in **English**
- Use meaningful variable and function names

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user avatar upload
fix: resolve token validation bug
docs: update README
refactor: simplify auth middleware
test: add login test cases
```

## Pull Request Process

1. Create a feature branch from `develop`
2. Make changes and ensure tests pass (`npm test`)
3. Run linter (`npm run lint`)
4. Run type check (`npx tsc --noEmit`)
5. Submit PR with clear description
6. Request review from maintainers

## Testing

- Add unit tests for new services/utilities
- Add integration tests for new API endpoints
- Run `npm run test:coverage` to check coverage
