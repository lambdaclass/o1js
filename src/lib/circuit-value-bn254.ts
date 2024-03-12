import 'reflect-metadata';
import { ProvablePureBn254, Snarky } from '../snarky.js';
import {
  provablePure,
  provableTuple,
  HashInput,
} from '../bindings/lib/provable-snarky.js';
import { provable } from '../bindings/lib/provable-snarky-bn254.js';
import type {
  InferJson,
  InferProvable,
  InferredProvable,
} from '../bindings/lib/provable-snarky.js';
import { FieldBn254 } from './field-bn254.js';
import { ProvableBn254 } from './provable-bn254.js';
import { assert } from './errors.js';
import { inCheckedComputation } from './provable-context-bn254.js';

// external API
export {
  ProvableExtendedBn254,
  ProvablePureExtendedBn254,
  provable,
  provablePure,
  Unconstrained,
};

// internal API
export {
  provableTuple,
  InferProvable,
  HashInput,
  InferJson,
  InferredProvable,
};

type ProvableExtensionBn254<T, TJson = any> = {
  toInput: (x: T) => { fields?: FieldBn254[]; packed?: [FieldBn254, number][] };
  toJSON: (x: T) => TJson;
  fromJSON: (x: TJson) => T;
  empty: () => T;
};

type ProvableExtendedBn254<T, TJson = any> = ProvableBn254<T> &
  ProvableExtensionBn254<T, TJson>;

type ProvablePureExtendedBn254<T, TJson = any> = ProvablePureBn254<T> &
  ProvableExtensionBn254<T, TJson>;

/**
* Container which holds an unconstrained value. This can be used to pass values
* between the out-of-circuit blocks in provable code.
*
* Invariants:
* - An `Unconstrained`'s value can only be accessed in auxiliary contexts.
* - An `Unconstrained` can be empty when compiling, but never empty when running as the prover.
*   (there is no way to create an empty `Unconstrained` in the prover)
*
* @example
* ```ts
* let x = Unconstrained.from(0n);
*
* class MyContract extends SmartContract {
*   `@method` myMethod(x: Unconstrained<bigint>) {
*
*     Provable.witness(Field, () => {
*       // we can access and modify `x` here
*       let newValue = x.get() + otherField.toBigInt();
*       x.set(newValue);
*
*       // ...
*     });
*
*     // throws an error!
*     x.get();
*   }
* ```
*/
class Unconstrained<T> {
  private option:
    | { isSome: true; value: T }
    | { isSome: false; value: undefined };

  private constructor(isSome: boolean, value?: T) {
    this.option = { isSome, value: value as any };
  }

  /**
   * Read an unconstrained value.
   *
   * Note: Can only be called outside provable code.
   */
  get(): T {
    if (inCheckedComputation() && !Snarky.bn254.run.inProverBlock())
      throw Error(`You cannot use Unconstrained.get() in provable code.

The only place where you can read unconstrained values is in Provable.witness()
and Provable.asProver() blocks, which execute outside the proof.
`);
    assert(this.option.isSome, 'Empty `Unconstrained`'); // never triggered
    return this.option.value;
  }

  /**
   * Modify the unconstrained value.
   */
  set(value: T) {
    this.option = { isSome: true, value };
  }

  /**
   * Set the unconstrained value to the same as another `Unconstrained`.
   */
  setTo(value: Unconstrained<T>) {
    this.option = value.option;
  }

  /**
   * Create an `Unconstrained` with the given `value`.
   *
   * Note: If `T` contains provable types, `Unconstrained.from` is an anti-pattern,
   * because it stores witnesses in a space that's intended to be used outside the proof.
   * Something like the following should be used instead:
   *
   * ```ts
   * let xWrapped = Unconstrained.witness(() => Provable.toConstant(type, x));
   * ```
   */
  static from<T>(value: T) {
    return new Unconstrained(true, value);
  }

  /**
   * Create an `Unconstrained` from a witness computation.
   */
  static witness<T>(compute: () => T) {
    return ProvableBn254.witness(
      Unconstrained.provable,
      () => new Unconstrained(true, compute())
    );
  }

  /**
   * Update an `Unconstrained` by a witness computation.
   */
  updateAsProver(compute: (value: T) => T) {
    return ProvableBn254.asProver(() => {
      let value = this.get();
      this.set(compute(value));
    });
  }

  static provable: ProvableBn254<Unconstrained<any>> & {
    toInput: (x: Unconstrained<any>) => {
      fields?: FieldBn254[];
      packed?: [FieldBn254, number][];
    };
  } = {
      sizeInFields: () => 0,
      toFields: () => [],
      toAuxiliary: (t?: any) => [t ?? new Unconstrained(false)],
      fromFields: (_, [t]) => t,
      check: () => { },
      toInput: () => ({}),
    };
}
