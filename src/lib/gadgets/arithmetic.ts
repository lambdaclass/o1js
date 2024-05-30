import { Bool } from '../bool.ts';
import { provableTuple } from '../circuit-value.ts';
import { Field } from '../core.ts';
import { assert } from '../errors.ts';
import { Provable } from '../provable.ts';
import { rangeCheck32, rangeCheckN } from './range-check.ts';

export { divMod32, addMod32 };

function divMod32(n: Field, quotientBits = 32) {
  if (n.isConstant()) {
    assert(
      n.toBigInt() < 1n << 64n,
      `n needs to fit into 64 bit, but got ${n.toBigInt()}`
    );

    let nBigInt = n.toBigInt();
    let q = nBigInt >> 32n;
    let r = nBigInt - (q << 32n);
    return {
      remainder: new Field(r),
      quotient: new Field(q),
    };
  }

  let [quotient, remainder] = Provable.witness(
    provableTuple([Field, Field]),
    () => {
      let nBigInt = n.toBigInt();
      let q = nBigInt >> 32n;
      let r = nBigInt - (q << 32n);
      return [new Field(q), new Field(r)];
    }
  );

  if (quotientBits === 1) {
    Bool.check(Bool.Unsafe.ofField(quotient));
  } else {
    rangeCheckN(quotientBits, quotient);
  }
  rangeCheck32(remainder);

  n.assertEquals(quotient.mul(1n << 32n).add(remainder));

  return {
    remainder,
    quotient,
  };
}

function addMod32(x: Field, y: Field) {
  return divMod32(x.add(y), 1).remainder;
}
