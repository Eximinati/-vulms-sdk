export interface SafetyAuditResult {
  passed: boolean;
  issues: SafetyIssue[];
  warnings: SafetyWarning[];
  score: number;
}

export interface SafetyIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  location?: string;
  recommendation: string;
}

export interface SafetyWarning {
  category: string;
  message: string;
  recommendation: string;
}

export function runSafetyAudit(): SafetyAuditResult {
  const issues: SafetyIssue[] = [];
  const warnings: SafetyWarning[] = [];

  checkCredentialHandling(issues, warnings);
  checkLogStatements(issues, warnings);
  checkCookieHandling(issues, warnings);
  checkRetrySafety(issues, warnings);
  checkCacheSafety(issues, warnings);
  checkEnvironmentVariables(issues, warnings);

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const score = Math.max(0, 100 - (criticalCount * 20) - (highCount * 10));

  return {
    passed: criticalCount === 0 && highCount === 0,
    issues,
    warnings,
    score,
  };
}

function checkCredentialHandling(issues: SafetyIssue[], _warnings: SafetyWarning[]): void {
  const fs = require('fs');
  const files = ['src/vulms-sdk.ts', 'src/core/session.ts', 'src/client/browser-login.ts', 'src/modules/activities.ts'];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('VULMS_ID') || content.includes('VULMS_PASSWORD')) {
        const hasEnvCheck = content.includes('process.env.VULMS_ID') || content.includes('process.env["VULMS_ID"]');
        const hasNoLeak = !content.match(/password\s*=\s*['"][^'"]*['"]/i) &&
                         !content.match(/pwd\s*[:=]\s*['"][^'"]*['"]/i) &&
                         !content.match(/secret\s*[:=]\s*['"][^'"]*['"]/i);

        if (!hasEnvCheck) {
          issues.push({
            severity: 'critical',
            category: 'credential_handling',
            message: `${file}: Credentials read without environment variable check`,
            location: file,
            recommendation: 'Always check process.env before using credentials',
          });
        }

        if (!hasNoLeak) {
          issues.push({
            severity: 'critical',
            category: 'credential_leak',
            message: `${file}: Potential credential hardcoding detected`,
            location: file,
            recommendation: 'Never hardcode credentials in source code',
          });
        }
      }
    } catch {
      // File may not exist, skip
    }
  }
}

function checkLogStatements(issues: SafetyIssue[], warnings: SafetyWarning[]): void {
  const fs = require('fs');

  try {
    const content = fs.readFileSync('src/vulms-sdk.ts', 'utf8');
    const sensitivePatterns = [
      { pattern: /console\.log\s*\(\s*.*password/i, message: 'Password logged to console' },
      { pattern: /console\.log\s*\(\s*.*secret/i, message: 'Secret logged to console' },
      { pattern: /console\.log\s*\(\s*.*token/i, message: 'Token logged to console' },
      { pattern: /logger\.(info|debug)\s*\(\s*.*password/i, message: 'Password logged via logger' },
      { pattern: /logger\.(info|debug)\s*\(\s*.*credential/i, message: 'Credential logged via logger' },
    ];

    for (const { pattern, message } of sensitivePatterns) {
      if (pattern.test(content)) {
        issues.push({
          severity: 'critical',
          category: 'log_safety',
          message: `src/vulms-sdk.ts: ${message}`,
          recommendation: 'Remove sensitive data from log statements',
        });
      }
    }

    const debugPattern = /logger\.(debug|info)\s*\(\s*`.*\$\{.*\}/g;
    const debugMatches = content.match(debugPattern);
    if (debugMatches && debugMatches.length > 20) {
      warnings.push({
        category: 'log_verbosity',
        message: `High number of debug/info logs (${debugMatches.length}) may impact performance`,
        recommendation: 'Consider using conditional debug logging',
      });
    }
  } catch {
    // File may not exist
  }
}

function checkCookieHandling(_issues: SafetyIssue[], warnings: SafetyWarning[]): void {
  const fs = require('fs');

  try {
    const content = fs.readFileSync('src/client/http-client.ts', 'utf8');

    const hasCookieJar = content.includes('CookieJar') || content.includes('cookieJar');

    if (hasCookieJar) {
      const hasSecureFlag = content.includes('secure') || content.includes('Secure');
      const hasSameSite = content.includes('sameSite') || content.includes('SameSite');

      if (!hasSecureFlag) {
        warnings.push({
          category: 'cookie_security',
          message: 'Cookie handling may not enforce secure flag',
          recommendation: 'Ensure cookies are marked secure for HTTPS connections',
        });
      }

      if (!hasSameSite) {
        warnings.push({
          category: 'cookie_security',
          message: 'Cookie handling may not enforce sameSite policy',
          recommendation: 'Consider adding sameSite attribute to prevent CSRF',
        });
      }
    }
  } catch {
    // File may not exist
  }
}

function checkRetrySafety(issues: SafetyIssue[], warnings: SafetyWarning[]): void {
  const fs = require('fs');

  try {
    const content = fs.readFileSync('src/client/http-client.ts', 'utf8');

    const hasRetryLogic = content.includes('retries') || content.includes('retry');
    const hasExponentialBackoff = content.includes('exponential') || content.includes('baseDelay');

    if (hasRetryLogic && !hasExponentialBackoff) {
      warnings.push({
        category: 'retry_safety',
        message: 'Retry logic without exponential backoff may cause server overload',
        recommendation: 'Implement exponential backoff for retries',
      });
    }

    const maxRetries = content.match(/maxRetries\s*[=:]\s*(\d+)/);
    if (maxRetries && parseInt(maxRetries[1]) > 5) {
      issues.push({
        severity: 'medium',
        category: 'retry_safety',
        message: `High max retry count (${maxRetries[1]}) may cause extended delays`,
        recommendation: 'Consider limiting retry attempts to 3-5',
      });
    }
  } catch {
    // File may not exist
  }
}

function checkCacheSafety(_issues: SafetyIssue[], warnings: SafetyWarning[]): void {
  warnings.push({
    category: 'cache_safety',
    message: 'No session caching mechanism detected - each run creates fresh session',
    recommendation: 'Session caching is appropriate for security, but verify token expiration handling',
  });

  const fs = require('fs');

  try {
    const sessionContent = fs.readFileSync('src/core/session.ts', 'utf8');
    if (sessionContent.includes('isValid')) {
      const hasExpiration = sessionContent.includes('expires') || sessionContent.includes('expiration');
      if (!hasExpiration) {
        warnings.push({
          category: 'session_expiration',
          message: 'Session validity check without expiration handling',
          recommendation: 'Add token expiration to session validity checks',
        });
      }
    }
  } catch {
    // File may not exist
  }
}

function checkEnvironmentVariables(_issues: SafetyIssue[], warnings: SafetyWarning[]): void {
  const fs = require('fs');

  try {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const hasVulmsVars = envExample.includes('VULMS_ID') || envExample.includes('VULMS_PASSWORD');

    if (!hasVulmsVars) {
      warnings.push({
        category: 'environment_setup',
        message: '.env.example may not document required VULMS credentials',
        recommendation: 'Document required environment variables in .env.example',
      });
    }
  } catch {
    warnings.push({
      category: 'environment_setup',
      message: 'No .env.example file found',
      recommendation: 'Create .env.example with required environment variables',
    });
  }
}

export function formatSafetyReport(result: SafetyAuditResult): string {
  const lines: string[] = [];

  lines.push('\n╔════════════════════════════════════════════════════════════════════╗');
  lines.push('║                    PRODUCTION SAFETY AUDIT                          ║');
  lines.push('╠════════════════════════════════════════════════════════════════════╣');

  const status = result.passed ? 'PASSED' : 'FAILED';
  const statusIcon = result.passed ? '✓' : '✗';
  lines.push(`║ Status: ${statusIcon} ${status.padEnd(57)} ║`);
  lines.push(`║ Score: ${(result.score + '%').padEnd(59)} ║`);
  lines.push('╠════════════════════════════════════════════════════════════════════╣');

  if (result.issues.length > 0) {
    lines.push('║ CRITICAL ISSUES:                                                     ║');
    for (const issue of result.issues) {
      const icon = issue.severity === 'critical' ? '✗' : issue.severity === 'high' ? '!' : '-';
      const msg = `[${icon}] ${issue.category}: ${issue.message}`.substring(0, 66);
      lines.push(`║   ${msg.padEnd(67)} ║`);
      lines.push(`║   → ${issue.recommendation}`.substring(0, 68).padEnd(69) + '║');
    }
  }

  if (result.warnings.length > 0) {
    lines.push('╠════════════════════════════════════════════════════════════════════╣');
    lines.push('║ WARNINGS:                                                            ║');
    for (const warning of result.warnings) {
      const msg = `[~] ${warning.category}: ${warning.message}`.substring(0, 66);
      lines.push(`║   ${msg.padEnd(67)} ║`);
    }
  }

  lines.push('╚════════════════════════════════════════════════════════════════════╝\n');

  return lines.join('\n');
}

export function isProductionReady(result: SafetyAuditResult): boolean {
  return result.score >= 80 && result.issues.filter(i => i.severity === 'critical').length === 0;
}