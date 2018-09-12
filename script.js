#!/usr/bin/env node

const backoff = require('backoff');
const util = require('util');
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

  try {
    await execFile(process.argv[1]);
  } catch (e) {
    console.error(e);
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
