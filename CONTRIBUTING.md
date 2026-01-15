# Contributing to AI Grievance Platform

Thank you for your interest in contributing to the AI Grievance Platform for Manipur!

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists
2. Create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots (if applicable)

### Development Setup

1. Fork the repository
2. Clone your fork:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/ai-grievance-platform.git
   cd ai-grievance-platform
   \`\`\`

3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

4. Create a branch:
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

5. Make your changes
6. Test thoroughly
7. Commit with clear messages:
   \`\`\`bash
   git commit -m "Add: Feature description"
   \`\`\`

8. Push and create a Pull Request

### Code Style Guidelines

- Use TypeScript for type safety
- Follow existing code structure
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await instead of promises

### File Naming Conventions

- Components: PascalCase (e.g., `ComplaintForm.tsx`)
- Utilities: camelCase (e.g., `helpers.ts`)
- Types: camelCase with `.types.ts` suffix
- Constants: UPPER_SNAKE_CASE

### Commit Message Format

\`\`\`
Type: Brief description

Detailed explanation (if needed)

Types:

- Add: New feature
- Fix: Bug fix
- Update: Modify existing feature
- Refactor: Code restructuring
- Docs: Documentation changes
- Style: Code style/formatting
- Test: Add or update tests
  \`\`\`

### Pull Request Guidelines

1. Title should be clear and descriptive
2. Link related issues
3. Describe changes made
4. Include screenshots for UI changes
5. Ensure all tests pass
6. Update documentation if needed

### Testing Your Changes

\`\`\`bash

# Run development server

npm run dev

# Build for production

npm run build

# Run linter

npm run lint
\`\`\`

## Areas for Contribution

### High Priority

- [ ] Add authentication system
- [ ] Implement rate limiting
- [ ] Add proper error boundaries
- [ ] Improve mobile responsiveness
- [ ] Add comprehensive tests

### Medium Priority

- [ ] Add more AI prompt variations
- [ ] Enhance image analysis
- [ ] Add department customization
- [ ] Implement real-time updates
- [ ] Add analytics dashboard

### Low Priority

- [ ] Add dark mode
- [ ] Internationalization (i18n)
- [ ] Add accessibility features
- [ ] Performance optimizations
- [ ] Add more documentation

## Feature Development Guidelines

### Adding New AI Features

1. Create new module in `src/lib/ai/`
2. Define TypeScript interfaces in `src/types/`
3. Integrate into orchestrator
4. Test with various inputs
5. Document behavior

### Adding New Components

1. Create in appropriate directory
2. Use Shadcn UI patterns
3. Make responsive
4. Add prop types
5. Include usage example

### Database Schema Changes

1. Create new migration file
2. Use incremental numbering
3. Test rollback
4. Update TypeScript types
5. Document changes

## Code Review Process

1. Maintainer reviews PR
2. Address feedback
3. Maintainer approves
4. Merge to main
5. Deploy to staging

## Questions?

- Open a GitHub Discussion
- Comment on related issues
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers
- Keep discussions professional

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation

Thank you for helping improve civic services! 🙏
