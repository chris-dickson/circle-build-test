#!/usr/bin/env node
/* eslint-disable no-console */
(async () => {
  const nodegit = require('nodegit');
  const path = require('path');
  const semver = require('semver-utils');

  const repository = await nodegit.Repository.open(path.resolve(__dirname, '.git'));
  const statuses = await repository.getStatus();

  // If there are working changes, fail.  Not allowed to run this thing with any changes to the working tree
  if (statuses.length > 0) {
    console.error('Please stash/commit/revert any changes to your working tree before creating a hotfix');
    //process.exit(1);
  }

  // Get the latest two versions
  const references = await repository.getReferenceNames(3);

  const production

  const versions = references.filter((reference) => reference.startsWith('refs/heads/release/'))
    .map((reference) => reference.replace('refs/heads/release/',''))
    .map((version) => semver.parse(version));

  console.log(references.length);



})();