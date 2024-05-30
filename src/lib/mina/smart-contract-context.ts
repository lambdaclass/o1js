import type { SmartContract } from '../zkapp.ts';
import type { AccountUpdate, AccountUpdateLayout } from '../account-update.ts';
import { Context } from '../global-context.ts';
import { currentTransaction } from './transaction-context.ts';

export { smartContractContext, SmartContractContext, accountUpdateLayout };

type SmartContractContext = {
  this: SmartContract;
  selfUpdate: AccountUpdate;
  selfLayout: AccountUpdateLayout;
};
let smartContractContext = Context.create<null | SmartContractContext>({
  default: null,
});

function accountUpdateLayout() {
  // in a smart contract, return the layout currently created in the contract call
  let layout = smartContractContext.get()?.selfLayout;

  // if not in a smart contract but in a transaction, return the layout of the transaction
  layout ??= currentTransaction()?.layout;

  return layout;
}
