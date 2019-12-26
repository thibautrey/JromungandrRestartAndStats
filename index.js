const request = require('request');
const {
  exec
} = require('child_process');

const pool = "PUTYOURPOOLID";
const user = "PUTYOURUSERFROMPOOLTOOL"
const node_config_path = "~/files/node-config.yaml";
const node_secret_path = "~/files/node_secret.yaml";
const genesis_path = "8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676";
const seconds = 15; // Choose the frequency to push data to pooltool. Minimum is 10 seconds
const unsyncBlock = 10;

setInterval(()=>{
request('http://127.0.0.1:3000/api/v0/node/stats', {
        json: true
      }, (err, res, data_settings) => {
       if(data_settings && data_settings.lastBlockHeight){
request(`https://tamoq3vkbl.execute-api.us-west-2.amazonaws.com/prod/sharemytip?poolid=${pool}&userid=${user}&genesispref=8e4d2a343f3dcf93&mytip=${data_settings.lastBlockHeight}`,{json:true}, (err, res, data_pool)=>{
console.log(data_pool);
if(data_pool && data_pool.pooltoolmax && (data_pool.pooltoolmax - data_settings.lastBlockHeight > unsyncBlock-1)){ 
exec(`jcli rest v0 shutdown get -h http://127.0.0.1:3000/api; nohup jormungandr --config ${node_config_path} --secret ${node_secret_path} --genesis-block-hash ${genesis_path} >> ~/logs/node.out 2>&1 &`, (error, stdout, stderr) => {
                console.log("Restarted node out of sync"+data_pool.pooltoolmax - data_settings.lastBlockHeight+"-"+data_pool.pooltoolmax+"-"+data_settings.lastBlockHeight+"uptime"+data_settings.uptime, stdout)
              });
}
});

 }
      });
}, seconds*1000);
