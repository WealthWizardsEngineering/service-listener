const R = require('ramda');
const capitalize = require('lodash.capitalize');
const fs = require('fs');

const loadExceptions = filename => {
  try {
    const exceptions = fs.readFileSync(filename);
    return JSON.parse(exceptions);
  } catch (err) {
    return { exceptions: [] };
  }
};

const rc = loadExceptions(`${process.cwd()}/audit/exceptions.json`);

const colourMap = {
  Low: 37, // White
  Moderate: 33, // Yellow
  High: 31, // Red
  Critical: 31, // Red
};

const isNotEmpty = R.complement(R.isEmpty);

const isExcludedUrl = R.compose(
  R.contains(R.__, rc.exceptions),
  R.trim,
  R.prop('url')
);

const getPaths = R.compose(
  R.reduce(R.concat, []),
  R.map(R.propOr([], 'paths')),
  R.prop('findings')
);

const displayVulnerability = vulnerability => {
  const severity = R.compose(
    capitalize,
    R.propOr('Missing Severity', 'severity')
  )(vulnerability);
  const colourCode = R.propOr(colourMap.High, severity, colourMap);
  const module = R.propOr('missing', 'module_name', vulnerability);
  const patched = R.propOr('missing', 'patched_versions', vulnerability);
  const url = R.propOr('missing info', 'url', vulnerability);
  const paths = getPaths(vulnerability);

  process.stdout.write(
    `\n\x1b[1;${colourCode}m${severity}\t ${vulnerability.title}\x1b[0m\n`
    + `Package\t\t ${module}\n`
    + `Patched in\t ${patched}\n`
    + `More info\t ${url}\n`
    + 'Paths:\n'
  );
  R.forEach(path => process.stdout.write(`\t${path}\n`), paths);

  return severity;
};

const reportVulnerabilities = vulnerabilities => {
  const severities = R.map(displayVulnerability, vulnerabilities);

  if (R.contains('High', severities) || R.contains('Critical', severities)) {
    return (process.exitCode = 1);
  }
  return (process.exitCode = 0);
};

const parseAuditItem = x => {
  try {
    return JSON.parse(x);
  } catch (err) {
    return { type: 'invalid' };
  }
};

const audit = fs.readFileSync('/dev/stdin', 'utf-8');

const parseYarnAudit = R.compose(
  R.reject(isExcludedUrl),
  R.map(R.path(['data', 'advisory'])),
  R.filter(R.propEq('type', 'auditAdvisory')),
  R.map(parseAuditItem),
  x => x.split('\n')
);

const parseNPMAudit = R.compose(
  R.reject(isExcludedUrl),
  R.values,
  R.propOr({}, 'advisories'),
  x => JSON.parse(x)
);

const parseAudit = auditInput => {
  try {
    return parseNPMAudit(auditInput);
  } catch (err) {
    return parseYarnAudit(auditInput);
  }
};

const validVulnerabilities = parseAudit(audit);

R.ifElse(isNotEmpty, reportVulnerabilities, () => process.stdout.write('\x1b[32m+\x1b[0m) No vulnerabilities found'))(validVulnerabilities);
