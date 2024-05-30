import type { AccountUpdateLayout } from '../account-update.ts';
import type { PublicKey } from '../signature.ts';
import { Context } from '../global-context.ts';

export { currentTransaction, CurrentTransaction, FetchMode };

type FetchMode = 'fetch' | 'cached' | 'test';
type CurrentTransaction = {
  sender?: PublicKey;
  layout: AccountUpdateLayout;
  fetchMode: FetchMode;
  isFinalRunOutsideCircuit: boolean;
  numberOfRuns: 0 | 1 | undefined;
};

let currentTransaction = Context.create<CurrentTransaction>();
