const _ =  require('lodash');
const dfns = require('date-fns')
const request = require('request');
const chalk = require('chalk');
const { exec } = require('child_process');
var schedule = require('node-schedule');
var express = require('express')
var app = express()

function setTimeoutAsync (callback, time) {
  setTimeout(function () {
    callback()
  }, time)
  return 0
}


request('http://127.0.0.1:3000/api/v0/stake_pool/66b93eddb36117aea14fc99ac63e03d42fe28e14360b2890f483cce9439047e0', {json:true}, (err, res, data_rewards) => {
  console.log(chalk.yellow(`<<Current block>> Stake: ₳${Math.round(data_rewards.total_stake*100/1000000000000)/100}M - Epoch: ${data_rewards.rewards.epoch}`));
  console.log(chalk.green(`<<Previous block>> Rewards for stakers: ₳${Math.round(data_rewards.rewards.value_for_stakers/1000000)} - Rewards for the pool: ₳${Math.round(data_rewards.rewards.value_taxed/1000000)}`));
  console.log(' ');
  request('http://127.0.0.1:3000/api/v0/leaders/logs', { json: true }, (err, res, data) => {
    if (err) { return console.log(err); }

    data.sort(function(a, b) {
        return (a.scheduled_at_date < b.scheduled_at_date) ? -1 : ((a.scheduled_at_date > b.scheduled_at_date) ? 1 : 0);
    });

    data.forEach((row)=> {
      const date = new Date(row.scheduled_at_time);
      const toDisplay = dfns.addHours(new Date(row.scheduled_at_time), 1);
      if(row.status !== "Pending" && row.status.Block){
        request('http://127.0.0.1:3000/api/v0/block/'+row.status.Block.block, {json:true}, (err, res, data_block)=>{
	   console.log(chalk.green(`produced - ${dfns.formatDistanceToNow(date, {includeSeconds: true})} ago ${dfns.getHours(toDisplay)}:${dfns.getMinutes(toDisplay)}:${dfns.getSeconds(toDisplay)} - ${row.status.Block.block} ${row.status.Block.block + !res.statusCode=="200"?"block not valid":"✓"}`))
        });
      }else if(row.status === "Pending"){
        console.log(chalk.cyan(`pending - ${dfns.formatDistanceToNow(date, {includeSeconds: true})} until production ${dfns.getHours(toDisplay)}:${dfns.getMinutes(toDisplay)}:${dfns.getSeconds(toDisplay)}`))
      }else if(row.status.Rejected){
        console.log(chalk.red(`rejected - ${dfns.formatDistanceToNow(date, {includeSeconds: true})} ago ${dfns.getHours(toDisplay)}:${dfns.getMinutes(toDisplay)}:${dfns.getSeconds(toDisplay)} - ${row.status.Rejected.reason}`));
      }
    })
  });
});


