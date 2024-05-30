import { it } from 'node:test';
import { Provable } from './provable.ts';
import { exists } from './gadgets/common.ts';
import { Field } from './field.ts';
import { expect } from 'expect';

it('can witness large field array', () => {
  let N = 100_000;
  let arr = Array<bigint>(N).fill(0n);

  Provable.runAndCheck(() => {
    // with exists
    let fields = exists(N, () => arr);

    // with Provable.witness
    let fields2 = Provable.witness(Provable.Array(Field, N), () =>
      arr.map(Field.from)
    );

    expect(fields.length).toEqual(N);
    expect(fields2.length).toEqual(N);
  });
});
