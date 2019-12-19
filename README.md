# JromungandrRestartAndStats

This project will help you to restart automatically your Jormungandr node a few minutes before it is supposed to validate a block. This ensures your pool is in sync with the tip of the blockchain.

---
## Requirements

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

## Install

    $ git clone https://github.com/thibautrey/JromungandrRestartAndStats
    $ cd JromungandrRestartAndStats
    $ npm install

## Configure app

Open `index.js` then edit it with your settings. You will need to change the first 4 lines :
### Put whatever the path to your node-config.yaml is
     const node_config_path = "~/files/node-config.yaml";
### Put whatever the path to your node_secret.yaml is
     const node_secret_path = "~/files/node_secret.yaml";
### This should be fine for ITN v1
     const genesis_path = "8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676";
### Set the amount of minutes before a block validation you want to restart your node. 5 minutes works fine for me.
     const minutesBeforeBlock = 5; 

## Running the project in the background

    $ nohup node index.js > output.log &

## Running the project in the foreground

    $ node index.js
    
## Displaying logs
   
    $ cat output.log
   
## Bonus: Display only some logs about your node block's validation   
   
    $ node justLogs.js
   
   
