# Security Policy

## 🔒 Reporting Security Vulnerabilities

The Flourish.ai team takes security seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### 🚨 How to Report a Security Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities by emailing: **[security@flourish-ai.com]** (replace with actual email)

Include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### 🕐 Response Timeline

- **Initial Response**: Within 48 hours of receiving your report
- **Status Update**: Within 7 days with our evaluation and expected timeline
- **Resolution**: Security patches will be prioritized and released as soon as possible

## 🛡️ Security Measures

### Data Protection

- **Local-First**: All user data remains on the user's machine
- **No Cloud Storage**: No personal data is transmitted to external servers
- **No Tracking**: No analytics, cookies, or user tracking
- **Open Source**: Full code transparency for security auditing

### Backend Security

- **Input Validation**: All user inputs are validated and sanitized
- **SQL Injection Protection**: Using SQLAlchemy ORM with parameterized queries
- **CORS Configuration**: Properly configured cross-origin resource sharing
- **Rate Limiting**: Protection against API abuse (planned)

### Frontend Security

- **XSS Protection**: React's built-in XSS protection mechanisms
- **Content Security Policy**: CSP headers to prevent code injection (planned)
- **Secure Dependencies**: Regular updates of frontend dependencies
- **Local Storage**: Sensitive data stored securely in browser local storage

### AI Model Security

- **Local Processing**: All AI analysis happens locally via Ollama
- **No Data Transmission**: User journal data never leaves the local machine
- **Model Integrity**: Using verified models from Ollama's official repository

## 🔧 Security Best Practices for Users

### Installation Security

1. Download only from official sources (GitHub releases)
2. Verify checksums when available
3. Use official package managers (npm, pip) when possible
4. Keep dependencies updated

### Usage Security

1. Keep your Ollama installation updated
2. Use strong passwords for any system accounts
3. Regularly backup your data
4. Be cautious when installing additional AI models

### Development Security

1. Use virtual environments for Python development
2. Keep development dependencies updated
3. Run security audits on dependencies
4. Use secure coding practices

## 🔍 Security Audits

We encourage security researchers to:

- Review our code for potential vulnerabilities
- Test the application in controlled environments
- Report findings through responsible disclosure

### Scope

- All code in this repository
- Dependencies and their configurations
- API endpoints and data handling
- Frontend security measures

### Out of Scope

- Physical security of user devices
- Social engineering attacks
- Denial of service attacks against local development servers
- Issues in third-party dependencies (unless exploitable in our context)

## 📜 Security Updates

Security updates will be:

- Released as soon as possible after discovery
- Documented in release notes with severity levels
- Communicated through GitHub security advisories
- Backward compatible when possible

### Severity Levels

- **Critical**: Immediate threat to user data or system security
- **High**: Significant security risk requiring prompt attention
- **Medium**: Moderate security risk with available workarounds
- **Low**: Minor security improvement or hardening measure

## 🏆 Recognition

We believe in recognizing security researchers who help keep Flourish.ai secure:

- **Public Recognition**: With permission, we'll acknowledge researchers in release notes
- **Hall of Fame**: Maintain a security researchers acknowledgment page
- **Responsible Disclosure**: We commit to working with researchers on disclosure timelines

## 📋 Security Checklist for Contributors

When contributing code, please ensure:

- [ ] Input validation for all user-provided data
- [ ] Proper error handling that doesn't leak sensitive information
- [ ] Secure coding practices following OWASP guidelines
- [ ] No hardcoded secrets or credentials
- [ ] Dependency security audit before adding new packages
- [ ] Consider privacy implications of new features

## 📞 Contact

For security-related questions or concerns:

- **Email**: [security@flourish-ai.com] (replace with actual email)
- **PGP Key**: [Available upon request]

For general questions about this security policy:

- **GitHub Issues**: For non-sensitive security policy questions
- **GitHub Discussions**: For general security best practices discussion

---

**Last Updated**: [Current Date]
**Version**: 1.0
