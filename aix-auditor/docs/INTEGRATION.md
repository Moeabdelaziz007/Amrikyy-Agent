# 🔗 AIX Security Auditor - Integration Guide

## Quick Integration (5 Minutes)

### Step 1: Install in Your Project

```bash
# Navigate to your project root
cd your-aix-project

# Copy auditor directory
cp -r /path/to/aix-auditor .

# Install dependencies
cd aix-auditor && npm install
```

### Step 2: Run Your First Audit

```bash
# Audit your agent file
node aix-auditor/bin/aix-audit.js your-agent.aix

# Auto-fix issues
node aix-auditor/bin/aix-audit.js your-agent.aix --fix
```

### Step 3: Add to package.json

```json
{
  "scripts": {
    "audit:security": "node aix-auditor/bin/aix-audit.js",
    "audit:fix": "node aix-auditor/bin/aix-audit.js --fix",
    "audit:strict": "node aix-auditor/bin/aix-audit.js --strict"
  }
}
```

---

## GitHub Actions Integration

### Automated Security Audits on Every Commit

Create `.github/workflows/aix-security-audit.yml`:

```yaml
name: AIX Security Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd aix-auditor && npm install
      
      - name: Run security audit
        run: node aix-auditor/bin/aix-audit.js your-agent.aix --json > security-report.json
      
      - name: Check for critical issues
        run: |
          CRITICAL=$(jq '.summary.critical' security-report.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "❌ Found $CRITICAL critical security issues!"
            exit 1
          fi
      
      - name: Upload security report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: security-report.json
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('security-report.json', 'utf8'));
            const body = `## 🔐 AIX Security Audit\n\n**Score:** ${report.score.overall}/100 (${report.score.grade})\n\n` +
                         `**Issues:** ${report.summary.critical} critical, ${report.summary.warnings} warnings`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });
```

---

## Pre-commit Hook Integration

### Block Commits with Security Issues

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "🔐 Running AIX security audit..."

# Find all .aix files
AIX_FILES=$(find . -name "*.aix" -o -name "*-agent.json")

if [ -z "$AIX_FILES" ]; then
  echo "✅ No AIX files found, skipping audit"
  exit 0
fi

# Audit each file
FAILED=0
for file in $AIX_FILES; do
  echo "Auditing: $file"
  
  # Run audit in strict mode
  if ! node aix-auditor/bin/aix-audit.js "$file" --strict --json > /dev/null 2>&1; then
    echo "❌ Security issues found in $file"
    echo "   Run: node aix-auditor/bin/aix-audit.js $file --fix"
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  echo ""
  echo "💡 Fix issues automatically:"
  echo "   node aix-auditor/bin/aix-audit.js your-file.aix --fix"
  echo ""
  echo "   Or bypass (not recommended):"
  echo "   git commit --no-verify"
  exit 1
fi

echo "✅ All AIX files passed security audit"
exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## VS Code Integration

### Add Tasks for Quick Auditing

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "AIX: Security Audit",
      "type": "shell",
      "command": "node aix-auditor/bin/aix-audit.js ${file}",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "AIX: Auto-fix Issues",
      "type": "shell",
      "command": "node aix-auditor/bin/aix-audit.js ${file} --fix",
      "problemMatcher": []
    },
    {
      "label": "AIX: Generate JSON Report",
      "type": "shell",
      "command": "node aix-auditor/bin/aix-audit.js ${file} --json > aix-security-report.json",
      "problemMatcher": []
    }
  ]
}
```

**Usage:** `Cmd+Shift+P` → "Tasks: Run Task" → Select audit task

---

## Docker Integration

### Audit in CI/CD Containers

Create `Dockerfile.auditor`:

```dockerfile
FROM node:18-alpine

WORKDIR /auditor

# Copy auditor
COPY aix-auditor/ .

# Install dependencies
RUN npm install

# Make script executable
RUN chmod +x bin/aix-audit.js

# Set entrypoint
ENTRYPOINT ["node", "bin/aix-audit.js"]
```

**Build:**
```bash
docker build -f Dockerfile.auditor -t aix-auditor:latest .
```

**Use:**
```bash
# Audit a file
docker run --rm -v $(pwd):/workspace aix-auditor:latest /workspace/agent.aix

# Auto-fix
docker run --rm -v $(pwd):/workspace aix-auditor:latest /workspace/agent.aix --fix

# JSON output
docker run --rm -v $(pwd):/workspace aix-auditor:latest /workspace/agent.aix --json
```

---

## GitLab CI Integration

Create `.gitlab-ci.yml`:

```yaml
security-audit:
  stage: test
  image: node:18
  
  before_script:
    - cd aix-auditor && npm install
  
  script:
    - node bin/aix-audit.js ../your-agent.aix --json | tee security-report.json
    - |
      CRITICAL=$(jq '.summary.critical' security-report.json)
      if [ "$CRITICAL" -gt 0 ]; then
        echo "Critical security issues found!"
        exit 1
      fi
  
  artifacts:
    reports:
      junit: security-report.json
    paths:
      - security-report.json
    expire_in: 30 days
  
  only:
    - merge_requests
    - main
```

---

## Jenkins Integration

Create `Jenkinsfile`:

```groovy
pipeline {
  agent any
  
  stages {
    stage('Security Audit') {
      steps {
        sh 'cd aix-auditor && npm install'
        sh 'node aix-auditor/bin/aix-audit.js your-agent.aix --json > security-report.json'
        
        script {
          def report = readJSON file: 'security-report.json'
          if (report.summary.critical > 0) {
            error("Critical security issues found!")
          }
        }
      }
    }
  }
  
  post {
    always {
      archiveArtifacts artifacts: 'security-report.json', fingerprint: true
    }
  }
}
```

---

## Badge Integration

### Add Security Badge to README

**GitHub Actions:**
```markdown
![AIX Security](https://github.com/your-org/your-repo/workflows/AIX%20Security%20Audit/badge.svg)
```

**Custom Badge (shields.io):**
```markdown
![Security Score](https://img.shields.io/badge/security-95%2F100-brightgreen)
```

**Generate badge from audit:**
```bash
# Run audit and extract score
SCORE=$(node aix-auditor/bin/aix-audit.js your-agent.aix --json | jq -r '.score.overall')

# Generate badge URL
echo "https://img.shields.io/badge/security-${SCORE}%2F100-brightgreen"
```

---

## Monitoring Integration

### Prometheus Metrics

Export audit results as Prometheus metrics:

```javascript
// prometheus-exporter.js
const { execSync } = require('child_process');
const fs = require('fs');

function exportMetrics() {
  const output = execSync('node aix-auditor/bin/aix-audit.js your-agent.aix --json').toString();
  const report = JSON.parse(output);
  
  const metrics = `
# HELP aix_security_score Overall security score (0-100)
# TYPE aix_security_score gauge
aix_security_score ${report.score.overall}

# HELP aix_critical_issues Number of critical security issues
# TYPE aix_critical_issues gauge
aix_critical_issues ${report.summary.critical}

# HELP aix_warnings Number of security warnings
# TYPE aix_warnings gauge
aix_warnings ${report.summary.warnings}
  `.trim();
  
  fs.writeFileSync('/var/lib/prometheus/aix-metrics.prom', metrics);
}

exportMetrics();
```

---

## Slack Integration

### Post Audit Results to Slack

```bash
#!/bin/bash

# Run audit
REPORT=$(node aix-auditor/bin/aix-audit.js your-agent.aix --json)
SCORE=$(echo "$REPORT" | jq -r '.score.overall')
GRADE=$(echo "$REPORT" | jq -r '.score.grade')
CRITICAL=$(echo "$REPORT" | jq -r '.summary.critical')

# Determine emoji
if [ "$SCORE" -ge 90 ]; then EMOJI="✅"; 
elif [ "$SCORE" -ge 70 ]; then EMOJI="⚠️";
else EMOJI="❌"; fi

# Post to Slack
curl -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d "{
    \"text\": \"$EMOJI AIX Security Audit\",
    \"blocks\": [
      {
        \"type\": \"section\",
        \"text\": {
          \"type\": \"mrkdwn\",
          \"text\": \"*Score:* $SCORE/100 ($GRADE)\\n*Critical Issues:* $CRITICAL\"
        }
      }
    ]
  }"
```

---

## NPM Package Integration

### Publish as Standalone Package

```bash
# Publish to npm registry
cd aix-auditor
npm publish

# Install in any project
npm install -g @amrikyy/aix-security-auditor

# Use globally
aix-audit your-agent.aix
```

---

## Scheduled Audits

### Daily Security Scans (Cron)

```bash
# Add to crontab
0 9 * * * cd /path/to/project && node aix-auditor/bin/aix-audit.js agent.aix --json > /var/log/aix-audit.json
```

### GitHub Actions (Weekly)

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM
```

---

## Support & Resources

- **Documentation:** https://github.com/Moeabdelaziz007/maya-travel-agent/tree/pr-7/aix-auditor
- **Issues:** https://github.com/Moeabdelaziz007/maya-travel-agent/issues
- **Security:** security@amrikyy.com

---

**Last Updated:** 2025-10-13  
**Version:** 1.0.0

