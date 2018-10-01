(async () => {
  const rp = require('request-promise');

  let circleBranch = process.env.CIRCLE_BRANCH;
  let jiraUser = process.env.JIRA_USER;
  let jiraPass = process.env.JIRA_PASS;
  try {
    if (circleBranch.startsWith('bugfix')) {
      circleBranch = circleBranch.replace('bugfix/','');
    } else if (circleBranch.startsWith('feature')) {
      circleBranch = circleBranch.replace('feature/','');
    }
    const pieces = circleBranch.split('_')[0].split('-');
    const url = `https://jira-beacon.uncharted.software/${pieces[0]}/${pieces[1]}`;
    console.log(`Checking ${url}`);
    await rp({
      method: 'GET',
      uri: url,
      headers: {
        'Authorization': `Basic ${Buffer.from(jiraUser + ":" + jiraPass).toString('base64')}`
      },
      json: true
    });
  } catch (err) {
    console.log('Branch name improperly formatted or JIRA ticket does not exist.  Should be: [\"feature\"|\"bugfix\"]/MEMEX-[0-9]*_the_bug_description_here');
    process.exit(1);
  }
  process.exit(0);
})();