// live Berkeley integration test
import {
  Field,
  PrivateKey,
  Mina,
  AccountUpdate,
  isReady,
  shutdown,
  fetchAccount,
  PublicKey,
} from 'snarkyjs';
import { adminPrivateKey, HelloWorld } from './hello_world.js';
await isReady;

let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
Mina.setActiveInstance(Berkeley);

let feePayerKey = PrivateKey.random();

console.log(
  `Funding fee payer ${feePayerKey
    .toPublicKey()
    .toBase58()} and waiting for inclusion in a block..`
);

await faucet(feePayerKey.toPublicKey());

let { nonce, balance } = Berkeley.getAccount(feePayerKey.toPublicKey());
console.log(
  `Using fee payer ${feePayerKey
    .toPublicKey()
    .toBase58()} with nonce ${nonce}, balance ${balance}`
);

let zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();

let transactionFee = 100_000_000;

console.log('Compiling smart contract..');
let { verificationKey } = await HelloWorld.compile();

let zkapp = new HelloWorld(zkappAddress);
let x = await zkapp.x.fetch();
let isDeployed = x?.equals(0).not().toBoolean() ?? false;

if (!isDeployed) {
  console.log(`Deploying zkapp for public key ${zkappAddress.toBase58()}.`);

  let transaction = await Mina.transaction(
    { feePayerKey, fee: transactionFee },
    () => {
      AccountUpdate.fundNewAccount(feePayerKey);
      zkapp.deploy({ zkappKey, verificationKey });
    }
  );

  console.log('Sending the transaction..');
  await (await transaction.send()).wait();
}

console.log('Fetching updated accounts..');
await fetchAccount({ publicKey: feePayerKey.toPublicKey() });
await fetchAccount({ publicKey: zkappAddress });

console.log('Trying to update deployed zkApp..');

let transaction = await Mina.transaction(
  { feePayerKey, fee: transactionFee },
  () => {
    zkapp.update(Field(4), adminPrivateKey);
  }
);
await transaction.prove();
console.log('Sending the transaction..');
await (await transaction.send()).wait();

console.log('Checking if the update was valid..');

try {
  (await zkapp.x.fetch())?.assertEquals(Field(4));
} catch (error) {
  throw new Error(
    `On-chain zkApp account doesn't match the expected state. ${error}`
  );
}
console.log('Success!');

async function waitForFunding(address: string): Promise<void> {
  let attempts = 0;
  let maxAttempts = 30;
  let interval = 30000;
  const executePoll = async (
    resolve: () => void,
    reject: (err: Error) => void | Error
  ) => {
    let { account } = await fetchAccount({ publicKey: address });
    attempts++;
    if (account) {
      return resolve();
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error(`Exceeded max attempts`));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };
  return new Promise(executePoll);
}

async function faucet(pub: PublicKey) {
  let address = pub.toBase58();
  let response = await fetch('https://faucet.minaprotocol.com/api/v1/faucet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      network: 'berkeley-qanet',
      address: address,
    }),
  });
  response = await response.json();
  if (response.status.toString() != 'success') {
    throw new Error(
      `Error funding account ${address}, got response status: ${response.status}, text: ${response.statusText}`
    );
  }
  await waitForFunding(address);
}

shutdown();
