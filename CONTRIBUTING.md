# Contributing to Flourish.ai

Thank you for your interest in contributing to Flourish.ai! We welcome contributions from developers, designers, mental health professionals, and anyone passionate about personal development technology.

## 🚀 Ways to Contribute

### 🐛 Bug Reports

- Use the [Issue Tracker](https://github.com/yourusername/flourish-ai/issues)
- Include detailed steps to reproduce
- Provide system information (OS, Python version, Node version)
- Include relevant error messages and logs

### ✨ Feature Requests

- Search existing issues first to avoid duplicates
- Clearly describe the problem you're trying to solve
- Explain why this feature would be useful to other users
- Consider providing mockups or examples

### 💻 Code Contributions

- Fork the repository
- Create a feature branch from `main`
- Follow our coding standards (see below)
- Include tests for new functionality
- Update documentation as needed
- Submit a Pull Request

### 📚 Documentation

- Improve existing documentation
- Add tutorials or examples
- Fix typos or clarify instructions
- Translate content to other languages

## 🛠️ Development Setup

### Prerequisites

- Python 3.8+
- Node.js 20+
- Git
- Ollama (for AI features)

### Local Development

1. Fork and clone your fork
2. Set up backend virtual environment
3. Install backend dependencies: `pip install -r requirements.txt`
4. Install frontend dependencies: `npm install`
5. Set up pre-commit hooks: `pre-commit install`

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

## 📝 Coding Standards

### Python (Backend)

- Follow PEP 8 style guidelines
- Use type hints where possible
- Write docstrings for functions and classes
- Keep functions focused and small
- Use meaningful variable names

### JavaScript/React (Frontend)

- Use ESLint configuration provided
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use descriptive component and prop names

### Git Commit Messages

- Use conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep first line under 50 characters
- Include detailed explanation in body if needed

Example:

```
feat(goals): add milestone progress tracking

- Added progress calculation based on completed milestones
- Updated goal detail view to show milestone status
- Added tests for progress calculation logic
```

## 🧪 Testing Guidelines

### Backend Testing

- Write unit tests for new functionality
- Include integration tests for API endpoints
- Test error conditions and edge cases
- Maintain test coverage above 80%

### Frontend Testing

- Test user interactions and component behavior
- Include accessibility testing
- Test responsive design on different screen sizes
- Verify data flow and state management

## 📋 Pull Request Process

1. **Before Starting:**

   - Check if an issue exists for your change
   - If not, create an issue to discuss the approach
   - Get feedback before starting large changes

2. **Creating the PR:**

   - Use a descriptive title and detailed description
   - Reference the issue number if applicable
   - Include screenshots for UI changes
   - Ensure all tests pass
   - Update documentation if needed

3. **Review Process:**
   - Be responsive to feedback
   - Make requested changes promptly
   - Ask questions if feedback is unclear
   - Maintain a respectful and collaborative tone

## 🔒 Security

- Report security vulnerabilities privately to maintainers
- Do not include sensitive information in public issues
- Follow secure coding practices
- Be mindful of user privacy and data protection

## 🌍 Community Guidelines

### Be Respectful

- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Collaborative

- Help others learn and grow
- Share knowledge and resources
- Provide constructive feedback
- Celebrate others' contributions

### Mental Health Considerations

- Be sensitive when discussing mental health topics
- Avoid making medical claims or giving medical advice
- Remember that users may be in vulnerable states
- Prioritize user safety and well-being in feature decisions

## 📞 Getting Help

- **General Questions:** Use GitHub Discussions
- **Bug Reports:** Use GitHub Issues
- **Security Issues:** Email maintainers directly
- **Feature Ideas:** Start with an issue for discussion

## 🎯 Priority Areas

We're especially looking for help with:

1. **Mobile Development** - React Native expertise
2. **Accessibility** - WCAG compliance and testing
3. **Internationalization** - Translation and localization
4. **AI/ML** - Model optimization and new AI features
5. **Design** - UI/UX improvements and user research
6. **Documentation** - Tutorials, examples, and guides

## 📄 License

By contributing to Flourish.ai, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- Annual contributor appreciation posts

Thank you for helping make Flourish.ai better for everyone! 🌱
