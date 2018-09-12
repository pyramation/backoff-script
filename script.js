#!/usr/bin/env node

const backoff = require('backoff');
const util = require('util');
const path = require('path');
const execFile = util.promisify(require('child_process').execFile);

class Backoff {
  constructor() {

    this.handleReady = this.handleReady.bind(this);
    this.handleBackoff = this.handleBackoff.bind(this);

    this.events = backoff.exponential({
      initialDelay: 10,
      maxDelay: 1000
    });
    this.events.on('backoff', this.handleBackoff);
    this.events.on('ready', this.handleReady);


    this.events.backoff();
  }
  handleBackoff(number, delay) {
    if (!number) return;
    console.log('start: ' + number + ' ' + delay + 'ms');
  }
  handleReady(number, delay) {
    const file = path.resolve(process.cwd() + '/' + process.argv[2]);

    execFile(file).then((stdout, stderr) => {
      if(stderr) throw new Error(stderr);
      this.events.reset();
      // success!
      process.exit(0);
    }).catch((error) => {
      console.error(error.stderr || error.message);
      console.log('Backoff: ' + number + ' ' + delay + 'ms');
      return this.events.backoff();
    });
  }
}

new Backoff();
