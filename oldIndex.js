const _ = require('lodash');
const dfns = require('date-fns')
const request = require('request');
const chalk = require('chalk');
const {
  exec
} = require('child_process');
var schedule = require('node-schedule');
var express = require('express')
var app = express()
const node_config_path = "~/files/node-config.yaml";
const node_secret_path = "~/files/node_secret.yaml";
const genesis_path = "8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676";
const minutes = 10;

function setTimeoutAsync(callback, time) {
  setTimeout(function() {
    callback()
  }, time)
  return 0
}


request('http://127.0.0.1:3000/api/v0/stake_pool/66b93eddb36117aea14fc99ac63e03d42fe28e14360b2890f483cce9439047e0', {
  json: true
}, (err, res, data_rewards) => {
  if (data_rewards) {
    console.log(chalk.yellow(`<<Current epoch>> Stake: ₳${Math.round(data_rewards.total_stake*100/1000000000000)/100}M - Epoch: ${data_rewards.rewards.epoch}`));
    console.log(chalk.green(`<<Previous epoch>> Rewards for stakers: ₳${Math.round(data_rewards.rewards.value_for_stakers/1000000)} - Rewards for the pool: ₳${Math.round(data_rewards.rewards.value_taxed/1000000)}`));
    console.log(' ');
    
    const runBabyRun = ()=>{
      let endCurrentEpoch;
      request('http://127.0.0.1:3000/api/v0/settings', {
        json: true
      }, (err, res, data_settings) => {
        endCurrentEpoch = dfns.addMinutes(dfns.addHours(new Date(data_settings.block0Time), 24*(parseInt(data_rewards.rewards.epoch)+1)), 15)        
        setTimeoutAsync(() => {
          runBabyRun()
        }, dfns.differenceInMilliseconds(endCurrentEpoch, Date.now()))
      });
    
    request('http://127.0.0.1:3000/api/v0/leaders/logs', {
      json: true
    }, (err, res, data) => {
      if (err) {
        return console.log(err);
      }

      if (data) {
        data.sort(function(a, b) {
          return (a.scheduled_at_date < b.scheduled_at_date) ? -1 : ((a.scheduled_at_date > b.scheduled_at_date) ? 1 : 0);
        });

        data.forEach((row) => {
          const date = new Date(row.scheduled_at_time);
          const toDisplay = new Date(row.scheduled_at_time);
          if (row.status !== "Pending" && row.status.Block) {
            request('http://127.0.0.1:3000/api/v0/block/' + row.status.Block.block, {
              json: true
            }, (err, res, data_block) => {
              console.log(chalk.green(`produced - ${dfns.formatDistanceToNow(date, {includeSeconds: true})} ago ${dfns.getHours(toDisplay)}:${dfns.getMinutes(toDisplay)}:${dfns.getSeconds(toDisplay)} - ${row.status.Block.block} ${row.status.Block.b$}`));
            });
          } else if (row.status === "Pending") {
            console.log(chalk.cyan(`pending - ${dfns.formatDistanceToNow(date, {includeSeconds: true})} until production ${dfns.getHours(toDisplay)}:${dfns.getMinutes(toDisplay)}:${dfns.getSeconds(toDisplay)}`))
          } else if (row.status.Rejected) {
            console.log(chalk.red(`rejected - ${dfns.formatDistanceToNow(date, {includeSeconds: true})} ago ${dfns.getHours(toDisplay)}:${dfns.getMinutes(toDisplay)}:${dfns.getSeconds(toDisplay)} - ${row.status.Rejected.reason}`));
          }
        })

        data.forEach((row) => {
          if (row.status === "Pending") {
            const localDate = dfns.subMinutes(new Date(row.scheduled_at_time), minutes);
            console.log("scheduled for ", localDate);
            setTimeoutAsync(() => {
              exec(`jcli rest v0 shutdown get -h http://127.0.0.1:3000/api; nohup jormungandr --config ${node_config_path} --secret ${node_secret_path} --genesis-block-hash ${genesis_path} >> ~/logs/node.out 2>&1 &`, (error, stdout, stderr) => {
                console.log(error);
                console.log(stderr);
                console.log("Restarted node", stdout)
              });
            }, dfns.differenceInMilliseconds(localDate, Date.now()))
          }
        });
      }
    });
    }
    runBabyRun();
  }
});

app.listen(8000)
