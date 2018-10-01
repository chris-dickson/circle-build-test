let circleBranch = process.env.CIRCLE_BRANCH;
try {
  if (circleBranch.startsWith('bugfix')) {
    circleBranch = circleBranch.replace('bugfix/','');
  } else if (circleBranch.startsWith('feature')) {
    circleBranch = circleBranch.replace('feature/','');
  }
  const pieces = circleBranch.split('_')[0].split('-');
  process.env.JIRA_PROJECT = pieces[0];
  process.env.JIRA_TICKET = pieces[1];
} catch (err) {
  process.exit(1);
}