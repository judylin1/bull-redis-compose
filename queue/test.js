'use strict';

const CONFIG = require('config');
const RedisURL = process.env.REDIS_URL || CONFIG.REDIS_URL;
const redis = require('redis');
const client = require('redis-url').connect(); // defaults to process.env.REDIS_URL
const Queue = require('bull');

// connect to Redis and start queue
const emailsQueue = Queue('emails', RedisURL);

// create a random number of jobs
const jobsTotal = Math.round(Math.random() * 10 + 10); // between 200 - 300 jobs

// make some dummy data
const dummyData = (numberOfEmailsToCreate, index) => {
  const createdDummyData = [];
  for (var i = 0; i < numberOfEmailsToCreate; i++) {
    createdDummyData.push({
      title: `Email ${index + 1} was successfully fired!`,
      subject: "You've got mail!",
      to: `${index + 1}@tourconnect.com`,
      body: 'Foo bar',
      emailToken: `token - ${index + 1}`,
      received: true,
      receivedAt: new Date('August 17, 2017 00:00:00'),
      createdAt: new Date('August 17, 2017 00:00:00'),
      companyId: `${index + 1}`,
      templateVars: {
        firstName: 'John',
        lastName: 'Smith',
        contractingPeriod: '01/04/2018 - 30/03/2019',
        customMessage: 'Hello world!',
      },
    });
  }
  return createdDummyData;
};

// generate X number of data
const createDummyData = (i) => {
  if (i) return dummyData(jobsTotal, i);
  return dummyData(jobsTotal);
};

function addToQueue(data, i, done) {
  // pass to data to UI
  // if even, add a delay
  // if (i % 2 === 0) {
  //   emailsQueue.add({
  //     index: i,
  //     data,
  //     jobId: `Fired email ${i}`,
  //   }, {
  //     delay: 3000,
  //     attempts: 3,
  //   });
  //   emailsQueue.pause();
  // } else {
    emailsQueue.add({
      index: i,
      data,
      jobId: `Fired email ${i}`,
    }, {
      attempts: 3,
    });
    emailsQueue.pause();
  // }
}

console.log(`Added ${jobsTotal} jobs to emails queue.`)

// every 3000 ms, add X number of jobs to queue
setInterval(function () {
  // this adds the job to the Redis queue
  createDummyData().map((data, i) => addToQueue(data, i));
}, 3000);
