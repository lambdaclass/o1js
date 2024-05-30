import { ZkProgram } from '../proof-system.ts';
import {
  equivalentProvable as equivalent,
  equivalentAsync,
  field,
  record,
} from '../testing/equivalent.ts';
import { Field } from '../core.ts';
import { Gadgets } from './gadgets.ts';
import { provable } from '../circuit-value.ts';
import { assert } from './common.ts';

let Arithmetic = ZkProgram({
  name: 'arithmetic',
  publicOutput: provable({
    remainder: Field,
    quotient: Field,
  }),
  methods: {
    divMod32: {
      privateInputs: [Field],
      method(a: Field) {
        return Gadgets.divMod32(a);
      },
    },
  },
});

await Arithmetic.compile();

const divMod32Helper = (x: bigint) => {
  let quotient = x >> 32n;
  let remainder = x - (quotient << 32n);
  return { remainder, quotient };
};
const divMod32Output = record({ remainder: field, quotient: field });

equivalent({
  from: [field],
  to: divMod32Output,
})(
  (x) => {
    assert(x < 1n << 64n, `x needs to fit in 64bit, but got ${x}`);
    return divMod32Helper(x);
  },
  (x) => {
    return Gadgets.divMod32(x);
  }
);

await equivalentAsync({ from: [field], to: divMod32Output }, { runs: 3 })(
  (x) => {
    assert(x < 1n << 64n, `x needs to fit in 64bit, but got ${x}`);
    return divMod32Helper(x);
  },
  async (x) => {
    return (await Arithmetic.divMod32(x)).publicOutput;
  }
);
