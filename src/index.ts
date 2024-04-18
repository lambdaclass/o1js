export type { ProvablePure } from './snarky.js';
export { Ledger } from './snarky.js';
export { Field, Bool, Group, Scalar } from './lib/core.js';
export {
  createForeignField,
  ForeignField,
  AlmostForeignField,
  CanonicalForeignField,
} from './lib/foreign-field.js';
export { createForeignCurve, ForeignCurve } from './lib/foreign-curve.js';
export { createEcdsa, EcdsaSignature } from './lib/foreign-ecdsa.js';
export { Poseidon, TokenSymbol, ProvableHashable } from './lib/hash.js';
export { Poseidon as PoseidonBn254 } from './lib/hash-bn254.js';
export { Keccak } from './lib/keccak.js';
export { Hash } from './lib/hashes-combined.js';

export { assert } from './lib/gadgets/common.js';

export * from './lib/signature.js';
export type {
  ProvableExtended,
  FlexibleProvable,
  FlexibleProvablePure,
  InferProvable,
} from './lib/circuit-value.js';
export {
  CircuitValue,
  prop,
  arrayProp,
  matrixProp,
  provable,
  provablePure,
  Struct,
  Unconstrained,
} from './lib/circuit-value.js';
export { Provable } from './lib/provable.js';
export { Circuit, Keypair, public_, circuitMain } from './lib/circuit.js';
export { UInt32, UInt64, Int64, Sign, UInt8 } from './lib/int.js';
export { Bytes } from './lib/provable-types/provable-types.js';
export { Packed, Hashed } from './lib/provable-types/packed.js';
export { Gadgets } from './lib/gadgets/gadgets.js';
export { Types } from './bindings/mina-transaction/types.js';

export {
  MerkleList,
  MerkleListIterator,
} from './lib/provable-types/merkle-list.js';

export * as Mina from './lib/mina.js';
export {
  type Transaction,
  type PendingTransaction,
  type IncludedTransaction,
  type RejectedTransaction,
} from './lib/mina/transaction.js';
export type { DeployArgs } from './lib/zkapp.js';
export {
  SmartContract,
  method,
  declareMethods,
  Account,
  Reducer,
} from './lib/zkapp.js';
export { state, State, declareState } from './lib/state.js';

export type { JsonProof } from './lib/proof-system.js';
export {
  Proof,
  SelfProof,
  verify,
  Empty,
  Undefined,
  Void,
  VerificationKey,
} from './lib/proof-system.js';
export { Cache, CacheHeader } from './lib/proof-system/cache.js';

export {
  Token,
  TokenId,
  AccountUpdate,
  Permissions,
  ZkappPublicInput,
  TransactionVersion,
  AccountUpdateForest,
  AccountUpdateTree,
} from './lib/account-update.js';

export { TokenAccountUpdateIterator } from './lib/mina/token/forest-iterator.js';
export { TokenContract } from './lib/mina/token/token-contract.js';

export type { TransactionStatus } from './lib/mina/graphql.js';
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
} from './lib/fetch.js';
export * as Encryption from './lib/encryption.js';
export * as Encoding from './bindings/lib/encoding.js';
export { Character, CircuitString } from './lib/string.js';
export { MerkleTree, MerkleWitness } from './lib/merkle-tree.js';
export { MerkleMap, MerkleMapWitness } from './lib/merkle-map.js';

export { Nullifier } from './lib/nullifier.js';

import { ExperimentalZkProgram, ZkProgram } from './lib/proof-system.js';
export { ZkProgram };

export { Crypto } from './lib/crypto.js';

export type { NetworkId } from './mina-signer/mina-signer.js';

export { setNumberOfWorkers } from './lib/proof-system/workers.js';

// Bn254
export type { ProvablePureBn254 } from './snarky.js';
export { FieldBn254, BoolBn254 } from './lib/core-bn254.js';
export {
  createForeignFieldBn254,
  ForeignFieldBn254,
  AlmostForeignFieldBn254,
  CanonicalForeignFieldBn254,
} from './lib/foreign-field-bn254.js';
export { createForeignCurveBn254, ForeignCurveBn254 } from './lib/foreign-curve-bn254.js';

export type { ProvableExtendedBn254 } from './lib/circuit-value-bn254.js';
export { provable as provableBn254 } from './lib/circuit-value-bn254.js';
export { ProvableBn254 } from './lib/provable-bn254.js';
export { CircuitBn254, KeypairBn254, publicBn254, circuitMainBn254 } from './lib/circuit-bn254.js';
export { GadgetsBn254 } from './lib/gadgets/gadgets-bn254.js';

// experimental APIs
import { memoizeWitness } from './lib/provable.js';
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
