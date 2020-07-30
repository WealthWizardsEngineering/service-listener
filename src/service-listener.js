#!/usr/bin/env node

const DeploymentOperator = require('./kubernetes-operator/DeploymentOperator').DeploymentOperator;

const deploymentOperator = new DeploymentOperator();

async function startListening() {
  await deploymentOperator.start();
}

startListening();

const exit = () => {
  deploymentOperator.stop();
  process.exit(0);
};

process.on('SIGTERM', () => exit('SIGTERM'))
  .on('SIGINT', () => exit('SIGINT'));
