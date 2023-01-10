const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  AccountId,
  Mnemonic,
  AccountUpdateTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
  //Grab your Hedera testnet account ID and private key from your .env file
  const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
  const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

  // If we weren't able to grab it, we should throw a new error
  if (myAccountId == null || myPrivateKey == null) {
    throw new Error(
      "Environment variables myAccountId and myPrivateKey must be present"
    );
  }

  // Create our connection to the Hedera network
  // The Hedera JS SDK makes this really easy!
  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);

  const newKey = PrivateKey.fromStringECDSA(
    "3030020100300706052b8104000a0422042066556aa2d0245a25aff4b98cbe417e3fc7e850e095c064dbaef2de2798338326"
  );
  console.log("Private Key: ", newKey.toString());
  console.log("Public Key: ", newKey.publicKey.toString());
  Mnemonic.fromString("");

  //Create a new account with 1,000 tinybar starting balance
  const transaction = await new AccountUpdateTransaction()
    .setAccountId(myAccountId)
    .setKey(newKey)
    .freezeWith(client);

  //Sign the transaction with the old key and new key
  const signTx = await (await transaction.sign(myPrivateKey)).sign(newKey);

  //Sign the transaction with the client operator private key and submit to a Hedera network
  const txResponse = await signTx.execute(client);

  //Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  console.log(receipt.status.toString());
}
main();
