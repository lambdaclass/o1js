import { fieldEncodings } from './base58.ts';
import { Field } from './core.ts';

export { TokenId, ReceiptChainHash, LedgerHash, EpochSeed, StateHash };

const { TokenId, ReceiptChainHash, EpochSeed, LedgerHash, StateHash } =
  fieldEncodings(Field);
