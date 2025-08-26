# Contributing to Website Inspector Pro

We love your input! We want to make contributing to Website Inspector Pro as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

### Local Development

```bash
# Clone your fork
git clone https://github.com/yourusername/website-inspector-pro.git
cd website-inspector-pro

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Check health
npm run health
```

## Code Style

* Use 4 spaces for indentation
* Use descriptive variable names
* Add comments for complex logic
* Follow existing patterns in the codebase

### AI Components

When working with AI features:
* Keep healing strategies simple and focused
* Add comprehensive error handling
* Document recovery patterns
* Test with real-world scenarios

## Testing

- Write tests for new features
- Test AI healing scenarios
- Verify error recovery works
- Check memory management

```bash
# Run comprehensive tests
npm test

# Test specific components
node test-ai-healing.js

# Check server health
npm run health
```

## Bug Reports

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We track feature requests using GitHub issues. Provide:

- Clear description of the feature
- Use cases and benefits
- Any implementation ideas
- Examples from other tools

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
