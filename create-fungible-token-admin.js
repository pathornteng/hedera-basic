console.clear();
require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TransferTransaction,
  AccountBalanceQuery,
  TokenAssociateTransaction,
  AccountCreateTransaction,
  Hbar,
  TokenUpdateTransaction,
} = require("@hashgraph/sdk");

// Configure accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const treasuryId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const treasuryKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

let aliceId;
let aliceKey;

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generateED25519();
const adminKey = PrivateKey.generateED25519();

async function createAliceAccount() {
  //Create new keys
  aliceKey = PrivateKey.generateED25519();
  const alicePublicKey = aliceKey.publicKey;

  //Create a new account with 1,000 tinybar starting balance
  const newAccount = await new AccountCreateTransaction()
    .setKey(alicePublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

  // Get the new account ID
  const getReceipt = await newAccount.getReceipt(client);
  aliceId = getReceipt.accountId;
  console.log(
    "- Created alice account successfully ",
    aliceId.toString(),
    "\n"
  );
}

async function main() {
  //create alice account
  await createAliceAccount();
  //CREATE FUNGIBLE TOKEN (STABLECOIN)
  let tokenCreateTx = await new TokenCreateTransaction()
    .setTokenName("USD Bar")
    .setTokenSymbol("USDB")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(10000)
    .setAdminKey(adminKey.publicKey)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .freezeWith(client);

  let tokenCreateSign = await (
    await tokenCreateTx.sign(treasuryKey)
  ).sign(adminKey);
  let tokenCreateSubmit = await tokenCreateSign.execute(client);
  let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
  let tokenId = tokenCreateRx.tokenId;
  console.log(`- Created token with ID: ${tokenId} \n`);

  await new Promise((resolve) => setTimeout(resolve, 10000));

  let updateTokenTx = await new TokenUpdateTransaction()
    .setTokenId(tokenId)
    .setAdminKey(aliceKey.publicKey)
    .freezeWith(client);
  let tokenUpdateSign = await (
    await updateTokenTx.sign(adminKey)
  ).sign(aliceKey);
  let tokenUpdateSubmit = await tokenUpdateSign.execute(client);
  let tokenUpdateRx = await tokenUpdateSubmit.getReceipt(client);
  console.log("- Updated token ", tokenUpdateRx.status.toString());
}
main();
