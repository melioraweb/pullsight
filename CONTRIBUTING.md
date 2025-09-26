# Contributing to PullSight AI 🤝

Thank you for your interest in contributing to PullSight AI! We welcome contributions from the community and are excited to see what you'll bring to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold the following principles:

- Be respectful and inclusive
- Exercise empathy and kindness
- Focus on what is best for the community
- Show courtesy and respect towards others

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pullsightai.git
   cd pullsightai
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/melioraweb/pullsightai.git
   ```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- MongoDB (local or cloud)
- Git

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure your environment variables
npm run dev
```

### AI Agent Setup

```bash
cd ai-agent
pip install -r requirements.txt
cp .env.example .env
# Configure your API keys
python main.py
```

## 💡 How to Contribute

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🧹 **Code refactoring**
- 🎨 **UI/UX improvements**
- 🧪 **Tests**

### Before You Start

1. **Check existing issues** to see if your contribution is already being worked on
2. **Create an issue** for new features or major changes to discuss the approach
3. **Assign yourself** to an issue when you start working on it

## 🔄 Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Write or update tests** for your changes

4. **Update documentation** if necessary

5. **Commit your changes** with a clear commit message:
   ```bash
   git commit -m "feat: add new AI agent for sentiment analysis"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Reference to related issues
   - Screenshots (if applicable)
   - Testing instructions

### Pull Request Guidelines

- Keep PRs focused and atomic
- Include tests for new functionality
- Update documentation for new features
- Follow the existing code style
- Write clear commit messages

## 📝 Coding Standards

### General Guidelines

- Write clean, readable, and well-documented code
- Follow existing patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic

### Backend (NestJS)

- Follow NestJS best practices
- Use TypeScript strictly
- Implement proper error handling
- Write unit and integration tests
- Use proper DTOs for validation

### Frontend (Next.js)

- Use TypeScript for all components
- Follow React best practices
- Implement responsive design
- Use Tailwind CSS for styling
- Write component tests

### AI Agent (Python)

- Follow PEP 8 style guidelines
- Use type hints
- Write docstrings for functions and classes
- Implement proper error handling
- Add unit tests

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Example:
```
feat(ai-agent): add sentiment analysis capability

- Implement new sentiment analysis model
- Add configuration options for different models
- Include comprehensive tests
```

## 🐛 Reporting Issues

When reporting issues, please include:

- **Clear title** and description
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (OS, Node.js version, etc.)
- **Screenshots** or error logs (if applicable)

Use our issue templates when available.

## 💡 Feature Requests

For feature requests:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** with implementation details
4. **Consider the impact** on existing functionality
5. **Discuss with maintainers** before starting large features

## 🧪 Testing

- Write tests for all new functionality
- Ensure all tests pass before submitting a PR
- Include both unit and integration tests
- Test edge cases and error scenarios

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# AI Agent tests
cd ai-agent && python -m pytest
```

## 📚 Documentation

- Update README.md for new features
- Add inline code comments
- Update API documentation
- Include examples for new functionality

## 🏆 Recognition

Contributors will be recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Community shoutouts

## 🤔 Questions?

If you have questions:

- Check existing issues and discussions
- Join our community discussions
- Reach out to maintainers: grozev@melioraweb.com

## 📄 License

By contributing to PullSight AI, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to PullSight AI! 🚀✨
