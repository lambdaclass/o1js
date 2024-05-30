import Client from '../dist/node/mina-signer/mina-signer.ts';
import type { Keypair } from '../dist/node/mina-signer/src/types.ts';

describe('Payment', () => {
  describe('Mainnet network', () => {
    let client: Client;
    let keypair: Keypair;

    beforeAll(async () => {
      client = new Client({ network: 'mainnet' });
      keypair = client.genKeys();
    });

    it('generates a signed payment', () => {
      const payment = client.signPayment(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      expect(payment.data).toBeDefined();
      expect(payment.signature).toBeDefined();
    });

    it('generates a signed transaction by using signTransaction', () => {
      const payment = client.signTransaction(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      expect(payment.data).toBeDefined();
      expect(payment.signature).toBeDefined();
    });

    it('verifies a signed payment', () => {
      const payment = client.signPayment(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      const verifiedPayment = client.verifyPayment(payment);
      expect(verifiedPayment).toBeTruthy();
      expect(client.verifyTransaction(payment)).toEqual(true);
    });

    it('verifies a signed payment generated by signTransaction', () => {
      const payment = client.signTransaction(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      const verifiedPayment = client.verifyPayment(payment);
      expect(verifiedPayment).toBeTruthy();
      expect(client.verifyTransaction(payment)).toEqual(true);
    });

    it('hashes a signed payment', () => {
      const payment = client.signPayment(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      const hashedPayment = client.hashPayment(payment);
      expect(hashedPayment).toBeDefined();
    });

    it('hashes a signed payment generated by signTransaction', () => {
      const payment = client.signTransaction(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      const hashedPayment = client.hashPayment(payment);
      expect(hashedPayment).toBeDefined();
    });

    it('does not verify a signed payment from `testnet`', () => {
      const payment = client.signPayment(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      const testnetClient = new Client({ network: 'testnet' });
      const invalidPayment = testnetClient.verifyPayment(payment);
      expect(invalidPayment).toBeFalsy();
      expect(testnetClient.verifyTransaction(payment)).toEqual(false);
    });
  });

  describe('Testnet network', () => {
    let client: Client;
    let keypair: Keypair;

    beforeAll(async () => {
      client = new Client({ network: 'testnet' });
      keypair = client.genKeys();
    });

    it('generates a signed payment', () => {
      const payment = client.signPayment(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      expect(payment.data).toBeDefined();
      expect(payment.signature).toBeDefined();
    });

    it('generates a signed transaction by using signTransaction', () => {
      const payment = client.signTransaction(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      expect(payment.data).toBeDefined();
      expect(payment.signature).toBeDefined();
    });

    it('verifies a signed payment', () => {
      const payment = client.signPayment(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      const verifiedPayment = client.verifyPayment(payment);
      expect(verifiedPayment).toBeTruthy();
      expect(client.verifyTransaction(payment)).toEqual(true);
    });

    it('verifies a signed payment generated by signTransaction', () => {
      const payment = client.signTransaction(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      const verifiedPayment = client.verifyPayment(payment);
      expect(verifiedPayment).toBeTruthy();
      expect(client.verifyTransaction(payment)).toEqual(true);
    });

    it('hashes a signed payment', () => {
      const payment = client.signPayment(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      const hashedPayment = client.hashPayment(payment);
      expect(hashedPayment).toBeDefined();
    });

    it('hashes a signed payment generated by signTransaction', () => {
      const payment = client.signTransaction(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      const hashedPayment = client.hashPayment(payment);
      expect(hashedPayment).toBeDefined();
    });

    it('does not verify a signed payment from `mainnet`', () => {
      const payment = client.signPayment(
        {
          to: keypair.publicKey,
          from: keypair.publicKey,
          amount: '1',
          fee: '1',
          nonce: '0',
        },
        keypair.privateKey
      );
      const mainnetClient = new Client({ network: 'mainnet' });
      const invalidPayment = mainnetClient.verifyPayment(payment);
      expect(invalidPayment).toBeFalsy();
      expect(mainnetClient.verifyTransaction(payment)).toEqual(false);
    });
  });
});
