# Security Policy

## 🔐 Our Commitment to Security

Security is a top priority for Amrikyy. We take the protection of our users' data and the integrity of our platform seriously.

---

## 🛡️ Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

---

## 🚨 Reporting a Vulnerability

### How to Report

If you discover a security vulnerability, please report it responsibly:

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email us at:
- **Email**: security@amrikyy.ai
- **Subject**: [SECURITY] Brief description of the issue

### What to Include

Please provide as much information as possible:

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact and severity
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Proof of Concept**: Code or screenshots demonstrating the vulnerability
5. **Suggested Fix**: If you have ideas for fixing the issue
6. **Your Contact**: How we can reach you for follow-up

### Example Report

```
Subject: [SECURITY] SQL Injection in booking endpoint

Description:
The /api/book endpoint is vulnerable to SQL injection through the 
'userId' parameter.

Impact:
An attacker could potentially access or modify database records.

Steps to Reproduce:
1. Send POST request to /api/book
2. Include malicious SQL in userId parameter: "1' OR '1'='1"
3. Observe unauthorized data access

Proof of Concept:
curl -X POST http://localhost:5001/api/book \
  -H "Content-Type: application/json" \
  -d '{"userId": "1'\'' OR '\''1'\''='\''1", "flightId": "123"}'

Suggested Fix:
Use parameterized queries instead of string concatenation.

Contact:
researcher@example.com
```

---

## 📋 Response Process

### Timeline

- **24 hours**: Initial acknowledgment of your report
- **72 hours**: Preliminary assessment and severity classification
- **7 days**: Detailed response with fix timeline
- **30 days**: Security patch released (for critical issues)

### Severity Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Remote code execution, data breach | 24-48 hours |
| **High** | Authentication bypass, privilege escalation | 3-7 days |
| **Medium** | XSS, CSRF, information disclosure | 7-14 days |
| **Low** | Minor information leaks, DoS | 14-30 days |

### What Happens Next

1. **Acknowledgment**: We confirm receipt of your report
2. **Investigation**: Our security team investigates the issue
3. **Validation**: We validate the vulnerability
4. **Fix Development**: We develop and test a fix
5. **Disclosure**: We coordinate disclosure with you
6. **Release**: We release a security patch
7. **Credit**: We credit you in our security advisories (if desired)

---

## 🏆 Security Researcher Recognition

We appreciate security researchers who help us keep Amrikyy secure:

### Hall of Fame

Security researchers who responsibly disclose vulnerabilities will be:
- Listed in our Security Hall of Fame
- Credited in release notes (with permission)
- Eligible for bug bounty rewards (coming soon)

### Bug Bounty Program

**Status**: Coming Soon

We're working on establishing a bug bounty program. Stay tuned for:
- Monetary rewards for valid vulnerabilities
- Tiered rewards based on severity
- Clear scope and rules of engagement

---

## 🔒 Security Features

### Authentication & Authorization

- ✅ **JWT Tokens**: Secure token-based authentication
- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **Session Management**: Secure session handling with Redis
- ✅ **Role-Based Access Control**: Granular permissions
- ✅ **Multi-Factor Authentication**: Optional 2FA support

### Data Protection

- ✅ **Encryption at Rest**: AES-256 encryption for sensitive data
- ✅ **Encryption in Transit**: TLS 1.3 for all connections
- ✅ **PII Protection**: Automatic PII detection and masking
- ✅ **Data Minimization**: Only collect necessary data
- ✅ **Secure Deletion**: Proper data deletion procedures

### API Security

- ✅ **Rate Limiting**: Prevent brute force and DoS attacks
- ✅ **Input Validation**: Joi/AJV schema validation
- ✅ **SQL Injection Protection**: Parameterized queries
- ✅ **XSS Protection**: Content Security Policy headers
- ✅ **CSRF Protection**: CSRF tokens for state-changing operations
- ✅ **CORS Configuration**: Strict origin validation

### Infrastructure Security

- ✅ **Helmet.js**: Security headers
- ✅ **Dependency Scanning**: Automated vulnerability scanning
- ✅ **Security Audits**: Regular npm audit checks
- ✅ **Secrets Management**: Environment variables, no hardcoded secrets
- ✅ **Logging & Monitoring**: Comprehensive audit logs

---

## 🔍 Security Best Practices

### For Users

1. **Strong Passwords**: Use unique, complex passwords
2. **Enable 2FA**: Enable two-factor authentication
3. **Keep Updated**: Keep your browser and apps updated
4. **Verify URLs**: Always check you're on the correct domain
5. **Report Suspicious Activity**: Contact us immediately

### For Developers

1. **Never Commit Secrets**: Use `.env` files, never commit them
2. **Validate Input**: Always validate and sanitize user input
3. **Use HTTPS**: Always use HTTPS in production
4. **Keep Dependencies Updated**: Regularly update dependencies
5. **Follow OWASP Top 10**: Be aware of common vulnerabilities
6. **Code Review**: Have security-focused code reviews
7. **Principle of Least Privilege**: Grant minimum necessary permissions

---

## 🛠️ Security Tools & Practices

### Automated Security

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Run security tests
npm run test:security
```

### Manual Security Testing

```bash
# Test authentication
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrong"}'

# Test rate limiting
for i in {1..150}; do
  curl http://localhost:5001/api/health
done

# Test input validation
curl -X POST http://localhost:5001/api/book \
  -H "Content-Type: application/json" \
  -d '{"userId": "<script>alert(1)</script>"}'
```

### Security Headers

We implement the following security headers:

```javascript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));
```

---

## 📊 Security Compliance

### Standards & Frameworks

We align with industry-standard security frameworks:

- ✅ **OWASP Top 10**: Protection against common vulnerabilities
- ✅ **CWE Top 25**: Mitigation of dangerous software weaknesses
- ✅ **GDPR**: Data protection and privacy compliance
- ✅ **PCI DSS**: Payment card industry standards (via Stripe)
- ✅ **SOC 2**: Security, availability, and confidentiality controls

### Regular Audits

- **Dependency Audits**: Weekly automated scans
- **Code Reviews**: Security-focused reviews for all PRs
- **Penetration Testing**: Annual third-party pen tests
- **Vulnerability Scanning**: Continuous automated scanning

---

## 🚫 Out of Scope

The following are **NOT** considered security vulnerabilities:

### Not Vulnerabilities

- ❌ Clickjacking on pages with no sensitive actions
- ❌ Missing security headers on non-sensitive pages
- ❌ Descriptive error messages without sensitive data
- ❌ Rate limiting bypass using multiple IPs (expected behavior)
- ❌ Self-XSS requiring user to paste malicious code
- ❌ Social engineering attacks
- ❌ Physical attacks
- ❌ Denial of Service attacks
- ❌ Spam or social engineering reports
- ❌ Reports from automated tools without validation

### Testing Guidelines

**DO**:
- ✅ Test against your own accounts
- ✅ Use test/sandbox environments when available
- ✅ Report findings responsibly
- ✅ Give us reasonable time to fix issues

**DON'T**:
- ❌ Access other users' data
- ❌ Perform destructive testing
- ❌ Test in production without permission
- ❌ Publicly disclose before we've fixed the issue
- ❌ Demand payment or threaten disclosure

---

## 📜 Disclosure Policy

### Coordinated Disclosure

We follow a coordinated disclosure process:

1. **Private Disclosure**: Report sent to security@amrikyy.ai
2. **Investigation**: We investigate and validate the issue
3. **Fix Development**: We develop and test a fix
4. **Patch Release**: We release a security patch
5. **Public Disclosure**: We publish a security advisory
6. **Credit**: We credit the researcher (with permission)

### Disclosure Timeline

- **Day 0**: Vulnerability reported
- **Day 1**: Acknowledgment sent
- **Day 7**: Fix developed and tested
- **Day 14**: Patch released
- **Day 30**: Public disclosure (if not critical)
- **Day 90**: Full details published (if critical)

### Security Advisories

We publish security advisories at:
- GitHub Security Advisories
- Our security page (coming soon)
- Release notes

---

## 🔐 Encryption Details

### Data at Rest

- **Algorithm**: AES-256-GCM
- **Key Management**: AWS KMS / Supabase Vault
- **Encrypted Fields**:
  - User passwords (bcrypt)
  - Payment information (tokenized via Stripe)
  - Personal identifiable information (PII)
  - API keys and secrets

### Data in Transit

- **Protocol**: TLS 1.3
- **Certificate**: Let's Encrypt / Cloudflare
- **Cipher Suites**: Modern, secure ciphers only
- **HSTS**: Enabled with preload

---

## 📞 Contact Information

### Security Team

- **Email**: security@amrikyy.ai
- **PGP Key**: [Coming Soon]
- **Response Time**: Within 24 hours

### General Support

- **Email**: support@amrikyy.ai
- **GitHub Issues**: For non-security bugs
- **GitHub Discussions**: For questions

---

## 📚 Additional Resources

### Security Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Our Documentation

- [API Reference](API_REFERENCE.md)
- [Environment Setup](ENV_SETUP.md)
- [Contributing Guide](CONTRIBUTING.md)

---

## 🙏 Thank You

Thank you for helping keep Amrikyy and our users safe!

Your responsible disclosure helps us:
- Protect our users
- Improve our security posture
- Build a more secure platform
- Foster a security-conscious community

**We appreciate your efforts!** 🛡️

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0  
**Security Contact**: security@amrikyy.ai
