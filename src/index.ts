export type { ProvablePure } from './snarky.js';
export { Ledger } from './snarky.js';
export { Field, Bool, Group, Scalar } from './lib/core.ts';
export {
  createForeignField,
  ForeignField,
  AlmostForeignField,
  CanonicalForeignField,
} from './lib/foreign-field.ts';
export { createForeignCurve, ForeignCurve } from './lib/foreign-curve.ts';
export { createEcdsa, EcdsaSignature } from './lib/foreign-ecdsa.ts';
export { Poseidon, TokenSymbol, ProvableHashable } from './lib/hash.ts';
export { Poseidon as PoseidonBn254 } from './lib/hash-bn254.ts';
export { Keccak } from './lib/keccak.ts';
export { Hash } from './lib/hashes-combined.ts';

export { assert } from './lib/gadgets/common.ts';

export * from './lib/signature.ts';
export type {
  ProvableExtended,
  FlexibleProvable,
  FlexibleProvablePure,
  InferProvable,
} from './lib/circuit-value.ts';
export {
  CircuitValue,
  prop,
  arrayProp,
  matrixProp,
  provable,
  provablePure,
  Struct,
  Unconstrained,
} from './lib/circuit-value.ts';
export { Provable } from './lib/provable.ts';
export { Circuit, Keypair, public_, circuitMain } from './lib/circuit.ts';
export { UInt32, UInt64, Int64, Sign, UInt8 } from './lib/int.ts';
export { Bytes } from './lib/provable-types/provable-types.ts';
export { Packed, Hashed } from './lib/provable-types/packed.ts';
export { Gadgets } from './lib/gadgets/gadgets.ts';
export { Types } from './bindings/mina-transaction/types.ts';

export {
  MerkleList,
  MerkleListIterator,
} from './lib/provable-types/merkle-list.ts';

export * as Mina from './lib/mina.ts';
export {
  type Transaction,
  type PendingTransaction,
  type IncludedTransaction,
  type RejectedTransaction,
} from './lib/mina/transaction.ts';
export type { DeployArgs } from './lib/zkapp.ts';
export {
  SmartContract,
  method,
  declareMethods,
  Account,
  Reducer,
} from './lib/zkapp.ts';
export { state, State, declareState } from './lib/state.ts';

export type { JsonProof } from './lib/proof-system.ts';
export {
  Proof,
  SelfProof,
  verify,
  Empty,
  Undefined,
  Void,
  VerificationKey,
} from './lib/proof-system.ts';
export { Cache, CacheHeader } from './lib/proof-system/cache.ts';

export {
  Token,
  TokenId,
  AccountUpdate,
  Permissions,
  ZkappPublicInput,
  TransactionVersion,
  AccountUpdateForest,
  AccountUpdateTree,
} from './lib/account-update.ts';

export { TokenAccountUpdateIterator } from './lib/mina/token/forest-iterator.ts';
export { TokenContract } from './lib/mina/token/token-contract.ts';

export type { TransactionStatus } from './lib/mina/graphql.ts';
export {
  fetchAccount,
  fetchLastBlock,
  fetchTransactionStatus,
  checkZkappTransaction,
  fetchEvents,
  addCachedAccount,
  setGraphqlEndpoint,
  setGraphqlEndpoints,
  setArchiveGraphqlEndpoint,
  sendZkapp,
  Lightnet,
} from './lib/fetch.ts';
export * as Encryption from './lib/encryption.ts';
export * as Encoding from './bindings/lib/encoding.ts';
export { Character, CircuitString } from './lib/string.ts';
export { MerkleTree, MerkleWitness } from './lib/merkle-tree.ts';
export { MerkleMap, MerkleMapWitness } from './lib/merkle-map.ts';

export { Nullifier } from './lib/nullifier.ts';

import { ExperimentalZkProgram, ZkProgram } from './lib/proof-system.ts';
export { ZkProgram };

export { Crypto } from './lib/crypto.ts';

export type { NetworkId } from './mina-signer/mina-signer.ts';

export { setNumberOfWorkers } from './lib/proof-system/workers.ts';

// Bn254
export type { ProvablePureBn254 } from './snarky.js';
export { FieldBn254, BoolBn254 } from './lib/core-bn254.ts';
export {
  createForeignFieldBn254,
  ForeignFieldBn254,
  AlmostForeignFieldBn254,
  CanonicalForeignFieldBn254,
} from './lib/foreign-field-bn254.ts';
export { createForeignCurveBn254, ForeignCurveBn254 } from './lib/foreign-curve-bn254.ts';

export type { ProvableExtendedBn254 } from './lib/circuit-value-bn254.ts';
export { provable as provableBn254 } from './lib/circuit-value-bn254.ts';
export { ProvableBn254 } from './lib/provable-bn254.ts';
export { CircuitBn254, KeypairBn254, publicBn254, circuitMainBn254 } from './lib/circuit-bn254.ts';
export { GadgetsBn254 } from './lib/gadgets/gadgets-bn254.ts';

// experimental APIs
import { memoizeWitness } from './lib/provable.ts';
export { Experimental };

const Experimental_ = {
  memoizeWitness,
};

/**
 * This module exposes APIs that are unstable, in the sense that the API surface is expected to change.
 * (Not unstable in the sense that they are less functional or tested than other parts.)
 */
namespace Experimental {
  /** @deprecated `ZkProgram` has moved out of the Experimental namespace and is now directly available as a top-level import `ZkProgram`.
   * The old `Experimental.ZkProgram` API has been deprecated in favor of the new `ZkProgram` top-level import.
   */
  export let ZkProgram = ExperimentalZkProgram;
  export let memoizeWitness = Experimental_.memoizeWitness;
}

Error.stackTraceLimit = 100000;

// deprecated stuff
export { isReady, shutdown };

/**
 * @deprecated `await isReady` is no longer needed. Remove it from your code.
 */
let isReady = Promise.resolve();

/**
 * @deprecated `shutdown()` is no longer needed, and is a no-op. Remove it from your code.
 */
function shutdown() { }
