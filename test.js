const {
  Client,
  PrivateKey,
  PublicKey,
  TokenType,
  TokenCreateTransaction,
  AccountId,
  TokenSupplyType,
  TransactionId,
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
  const client = Client.forTestnet();
  const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
  const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
  const newAccountPrivateKey = PrivateKey.generateED25519();
  client.setOperator(myAccountId, newAccountPrivateKey);
  const transaction = new TokenCreateTransaction()
    .setTokenName("New NFT")
    .setTokenSymbol("LNFT")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(myAccountId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(250)
    .setSupplyKey(myPrivateKey)
    //.setNodeAccountIds([new AccountId(7)])
    .setTransactionId(TransactionId.generate(myAccountId));
  transaction.freezeWith(client);
  const signedTx = await transaction.sign(myPrivateKey);
  //console.log(transaction.expirationTime);
  const result = await signedTx.execute(client);
  const getReceipt = await result.getReceipt(client);
  //console.log(getReceipt);
}
main();
