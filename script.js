#!/usr/bin/env node

const backoff = require('backoff');
const util = require('util');
const path = require('path');
const execFile = util.promisify(require('child_process').execFile);

class Backoff {
  constructor() {
    this.events = backoff.exponential({
      initialDelay: 10,
      maxDelay: 1000
    });

    this.events.on('backoff', this.handleBackoff);
    this.events.on('ready', this.handleReady);
    this.events.backoff();

    this.handleReady = this.handleReady.bind(this);
    this.handleBackoff = this.handleBackoff.bind(this);
  }
  handleBackoff(number, delay) {
    if (!number) return;
    console.log('start: ' + number + ' ' + delay + 'ms');
  }
  async handleReady(number, delay) {
    const file = path.resolve(process.cwd() + '/' + process.argv[2]);
    let stderr;
    let stdout;
    let failed = false;

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
      return this.events.backoff();
    } else {
      this.events.reset();

      // success!
      process.exit(0);
    }

  }
}

new Backoff();
