console.clear();
require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
  TopicDeleteTransaction,
} = require("@hashgraph/sdk");

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();

// Set the operator account ID and operator private key
client.setOperator(operatorId, operatorKey);

async function main() {
  //Create a new topic
  let txResponse = await new TopicCreateTransaction()
    .setAdminKey(operatorKey)
    .execute(client);

  //Grab the newly generated topic ID
  let receipt = await txResponse.getReceipt(client);
  let topicId = receipt.topicId;
  console.log(`Your topic ID is: ${topicId}`);

  // Wait 5 seconds between consensus topic creation and subscription creation
  await new Promise((resolve) => setTimeout(resolve, 5000));

  //Create the query
  new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, null, (message) => {
      let messageAsString = Buffer.from(message.contents, "utf8").toString();
      console.log(
        `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
      );
    });

  // Send one message
  let sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: "Hello, CCMedia!",
  }).execute(client);
  const getReceipt = await sendResponse.getReceipt(client);

  //Get the status of the transaction
  const transactionStatus = getReceipt.status;
  console.log("The message transaction status: " + transactionStatus);

  const transaction = await new TopicDeleteTransaction()
    .setTopicId(topicId)
    .freezeWith(client);

  //Sign the transaction with the admin key
  const signTx = await transaction.sign(operatorKey);

  //Sign with the client operator private key and submit to a Hedera network
  const response = await signTx.execute(client);

  //Request the receipt of the transaction
  const result = await response.getReceipt(client);
  console.log(result);
}
main();
