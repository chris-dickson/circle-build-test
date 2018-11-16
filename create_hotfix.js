#!/usr/bin/env node
/* eslint-disable no-console */
(async () => {
  const nodegit = require('nodegit');
  const path = require('path');
  const Semver = require('semver-utils');
  const List = require('prompt-list');


  const repository = await nodegit.Repository.open(path.resolve(__dirname, '.git'));
  const statuses = await repository.getStatus();

  const semverComparator = (v1,v2) => {
    if (v1.major !== v2.major) {
      return v2.major - v1.major;
    } else if (v2.minor !== v1.minor) {
      return v2.minor - v1.minor;
    } else if (v2.patch !== v1.patch) {
      return v2.patch - v1.patch;
    }
    return 0;
  };

  const strinifyVersion = (v) => {
    return `${v.major}.${v.minor}.${v.patch}`;
  };

  const branchFromVersion = (v) => {
    return `release/${strinifyVersion(v)}`;
  };


  // If there are working changes, fail.  Not allowed to run this thing with any changes to the working tree
  if (statuses.length > 0) {
    console.error('Please stash/commit/revert any changes to your working tree before creating a hotfix');
    //process.exit(1);
  }

  // Get the latest two versions
  const references = await repository.getReferenceNames(3);

  const sortedVersions = references.filter((reference) => reference.startsWith('refs/heads/release/'))
    .map((reference) => reference.replace('refs/heads/release/',''))
    .map((version) => Semver.parse(version))
    .map((version) => {
      version.major = parseInt(version.major,10);
      version.minor = parseInt(version.minor,10);
      version.patch = parseInt(version.patch,10);

      return version;
    })
    .sort(semverComparator);

  const production = sortedVersions[0];
  let staging = null;
  for (let i = 0; i < sortedVersions.length && staging === null; i++) {
    if (sortedVersions[i].major < production.major) {
      staging = sortedVersions[i];
    }
  }

  const prodMinor = JSON.parse(JSON.stringify(production));
  prodMinor.minor++;

  const prodHotfix = JSON.parse(JSON.stringify(production));
  prodHotfix.patch++;

  const stagingMinor = JSON.parse(JSON.stringify(staging));
  stagingMinor.minor++;

  const stagingHotfix = JSON.parse(JSON.stringify(staging));
  stagingHotfix.patch++;

  const newRelease = JSON.parse(JSON.stringify(production));
  newRelease.major++;
  newRelease.minor = 0;
  newRelease.patch = 0;

  const choices = [
        {name:`Production-${strinifyVersion(prodMinor)}`, branchFrom: branchFromVersion(production), branchTo: branchFromVersion(prodMinor)},
        {name:`Production-${strinifyVersion(prodHotfix)}`, branchFrom: branchFromVersion(production), branchTo: branchFromVersion(prodHotfix)},
        {name:`Staging-${strinifyVersion(stagingMinor)}`, branchFrom: branchFromVersion(staging), branchTo: branchFromVersion(stagingMinor)},
        {name:`Staging-${strinifyVersion(stagingHotfix)}`, branchFrom: branchFromVersion(staging), branchTo: branchFromVersion(stagingHotfix)},
        {name:`New Release-${strinifyVersion(newRelease)}` , branchFrom: 'master', branchTo: branchFromVersion(newRelease)}
    ];

  const list = new List({
      name: 'Release',
      message: 'What would you like to do?',
      choices
  });

  const choiceName = await list.run();
  if (choiceName === undefined) {
    process.exit(0);
  }

  const choice = choices.filter((c) => c.name === choiceName)[0];


  // Checkout the branchFrom selection
  const branchFrom = await repository.getBranch(`refs/remotes/origin/${choice}`);
  repository.checkoutRef(branchFrom);

  // Create a branch off of this named branchTo
  nodegit.Branch.create(repository, choice.branchTo);



})();
