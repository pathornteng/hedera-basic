# hedera-basic

This repository contains a set of sample code that uses Hedera services

## Setup & Install

```bash
git clone github.com/pathornteng/hedera-basic
cd hedera-basic
npm install
```

## Configuration

You need to configure private key and account id to run the script

```bash
cp .env_sample .env
```

MY_ACCOUNT_ID = enter testnet hedera account id

MY_PRIVATE_KEY = < enter testnet hedera private key

## Run scripts

To run a script such as creating a HCS topic and submiting a message

```bash
node submit-message-hcs.js
```
