#!/usr/bin/env node

const backoff = require('backoff');
const util = require('util');
const path = require('path');
const execFile = util.promisify(require('child_process').execFile);

var waitFor = backoff.exponential({
  initialDelay: 10,
  maxDelay: 1000
});

waitFor.on('backoff', function(number, delay) {
  if (!number) return;
  console.log('start: ' + number + ' ' + delay + 'ms');
});

waitFor.on('ready', async function(number, delay) {
  let failed = false;

  const file = path.resolve(process.cwd() + '/' + process.argv[2]);
  let stderr, stdout;

  try {
    ({stderr, stdout} = await execFile(file));
  } catch (e) {
    console.error(e.stderr);
    failed = true;
  }

  if (stderr) {
    console.error(stderr);
    failed = true;
  }

  if (failed) {
    console.log('Backoff: ' + number + ' ' + delay + 'ms');
    return waitFor.backoff();
  } else {
    waitFor.reset();

    // success!
    process.exit(0);
  }

});

waitFor.backoff();
