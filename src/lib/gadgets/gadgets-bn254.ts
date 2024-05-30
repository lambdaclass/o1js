/**
 * Wrapper file for various gadgets, with a namespace and doccomments.
 */
import {
  compactMultiRangeCheck,
  multiRangeCheck,
  rangeCheck16,
  rangeCheck64,
  rangeCheck32,
  rangeCheckN,
  isInRangeN,
  rangeCheck8,
} from './range-check-bn254.ts';
import {
  not,
  rotate32,
  rotate64,
  xor,
  and,
  leftShift64,
  rightShift64,
  leftShift32,
} from './bitwise.ts';
import { FieldBn254 } from '../core-bn254.ts';
import { ForeignFieldBn254, Field3, Sum } from './foreign-field-bn254.ts';
import { divMod32, addMod32 } from './arithmetic.ts';
import { SHA256 } from './sha256.ts';

export { GadgetsBn254 };

const GadgetsBn254 = {
  /**
   * Asserts that the input value is in the range [0, 2^64).
   *
   * This function proves that the provided field element can be represented with 64 bits.
   * If the field element exceeds 64 bits, an error is thrown.
   *
   * @param x - The value to be range-checked.
   *
   * @throws Throws an error if the input value exceeds 64 bits.
   *
   * @example
   * ```ts
   * const x = Provable.witness(FieldBn254, () => FieldBn254(12345678n));
   * GadgetsBn254.rangeCheck64(x); // successfully proves 64-bit range
   *
   * const xLarge = Provable.witness(FieldBn254, () => FieldBn254(12345678901234567890123456789012345678n));
   * GadgetsBn254.rangeCheck64(xLarge); // throws an error since input exceeds 64 bits
   * ```
   *
   * **Note**: Small "negative" field element inputs are interpreted as large integers close to the field size,
   * and don't pass the 64-bit check. If you want to prove that a value lies in the int64 range [-2^63, 2^63),
   * you could use `rangeCheck64(x.add(1n << 63n))`.
   */
  rangeCheck64(x: FieldBn254) {
    return rangeCheck64(x);
  },

  /**
   * Asserts that the input value is in the range [0, 2^32).
   *
   * This function proves that the provided field element can be represented with 32 bits.
   * If the field element exceeds 32 bits, an error is thrown.
   *
   * @param x - The value to be range-checked.
   *
   * @throws Throws an error if the input value exceeds 32 bits.
   *
   * @example
   * ```ts
   * const x = Provable.witness(FieldBn254, () => FieldBn254(12345678n));
   * GadgetsBn254.rangeCheck32(x); // successfully proves 32-bit range
   *
   * const xLarge = Provable.witness(FieldBn254, () => FieldBn254(12345678901234567890123456789012345678n));
   * GadgetsBn254.rangeCheck32(xLarge); // throws an error since input exceeds 32 bits
   * ```
   *
   * **Note**: Small "negative" field element inputs are interpreted as large integers close to the field size,
   * and don't pass the 32-bit check. If you want to prove that a value lies in the int32 range [-2^31, 2^31),
   * you could use `rangeCheck32(x.add(1n << 31n))`.
   */
  rangeCheck32(x: FieldBn254) {
    return rangeCheck32(x);
  },

  /**
   * Asserts that the input value is in the range [0, 2^n). `n` must be a multiple of 16.
   *
   * This function proves that the provided field element can be represented with `n` bits.
   * If the field element exceeds `n` bits, an error is thrown.
   *
   * @param x - The value to be range-checked.
   * @param n - The number of bits to be considered for the range check.
   * @param message - Optional message to be displayed when the range check fails.
   *
   * @throws Throws an error if the input value exceeds `n` bits.
   *
   * @example
   * ```ts
   * const x = Provable.witness(FieldBn254, () => FieldBn254(12345678n));
   * GadgetsBn254.rangeCheckN(32, x); // successfully proves 32-bit range
   *
   * const xLarge = Provable.witness(FieldBn254, () => FieldBn254(12345678901234567890123456789012345678n));
   * GadgetsBn254.rangeCheckN(32, xLarge); // throws an error since input exceeds 32 bits
   * ```
   */
  rangeCheckN(n: number, x: FieldBn254, message?: string) {
    return rangeCheckN(n, x, message);
  },

  /**
   * Checks whether the input value is in the range [0, 2^n). `n` must be a multiple of 16.
   *
   * This function proves that the provided field element can be represented with `n` bits.
   * If the field element exceeds `n` bits, `Bool(false)` is returned and `Bool(true)` otherwise.
   *
   * @param x - The value to be range-checked.
   * @param n - The number of bits to be considered for the range check.
   *
   * @returns a Bool indicating whether the input value is in the range [0, 2^n).
   *
   * @example
   * ```ts
   * const x = Provable.witness(FieldBn254, () => FieldBn254(12345678n));
   * let inRange = GadgetsBn254.isInRangeN(32, x); // return Bool(true)
   * ```
   */
  isInRangeN(n: number, x: FieldBn254) {
    return isInRangeN(n, x);
  },
  /*
   * Asserts that the input value is in the range [0, 2^16).
   *
   * See {@link GadgetsBn254.rangeCheck64} for analogous details and usage examples.
   */
  rangeCheck16(x: FieldBn254) {
    return rangeCheck16(x);
  },

  /**
   * Asserts that the input value is in the range [0, 2^8).
   *
   * See {@link GadgetsBn254.rangeCheck64} for analogous details and usage examples.
   */
  rangeCheck8(x: FieldBn254) {
    return rangeCheck8(x);
  },

  /**
   * A (left and right) rotation operates similarly to the shift operation (`<<` for left and `>>` for right) in JavaScript,
   * with the distinction that the bits are circulated to the opposite end of a 64-bit representation rather than being discarded.
   * For a left rotation, this means that bits shifted off the left end reappear at the right end.
   * Conversely, for a right rotation, bits shifted off the right end reappear at the left end.
   *
   * It’s important to note that these operations are performed considering the big-endian 64-bit representation of the number,
   * where the most significant (64th) bit is on the left end and the least significant bit is on the right end.
   * The `direction` parameter is a string that accepts either `'left'` or `'right'`, determining the direction of the rotation.
   *
   * **Important:** The gadget assumes that its input is at most 64 bits in size.
   *
   * If the input exceeds 64 bits, the gadget is invalid and fails to prove correct execution of the rotation.
   * To safely use `rotate64()`, you need to make sure that the value passed in is range-checked to 64 bits;
   * for example, using {@link GadgetsBn254.rangeCheck64}.
   *
   * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#rotation)
   *
   * @param field {@link FieldBn254} element to rotate.
   * @param bits amount of bits to rotate this {@link FieldBn254} element with.
   * @param direction left or right rotation direction.
   *
   * @throws Throws an error if the input value exceeds 64 bits.
   *
   * @example
   * ```ts
   * const x = Provable.witness(FieldBn254, () => FieldBn254(0b001100));
   * const y = GadgetsBn254.rotate64(x, 2, 'left'); // left rotation by 2 bits
   * const z = GadgetsBn254.rotate64(x, 2, 'right'); // right rotation by 2 bits
   * y.assertEquals(0b110000);
   * z.assertEquals(0b000011);
   *
   * const xLarge = Provable.witness(FieldBn254, () => FieldBn254(12345678901234567890123456789012345678n));
   * GadgetsBn254.rotate64(xLarge, 32, "left"); // throws an error since input exceeds 64 bits
   * ```
   */
  rotate64(field: FieldBn254, bits: number, direction: 'left' | 'right' = 'left') {
    return rotate64(field, bits, direction);
  },
  /**
   * A (left and right) rotation operates similarly to the shift operation (`<<` for left and `>>` for right) in JavaScript,
   * with the distinction that the bits are circulated to the opposite end of a 32-bit representation rather than being discarded.
   * For a left rotation, this means that bits shifted off the left end reappear at the right end.
   * Conversely, for a right rotation, bits shifted off the right end reappear at the left end.
   *
   * It’s important to note that these operations are performed considering the big-endian 32-bit representation of the number,
   * where the most significant (32th) bit is on the left end and the least significant bit is on the right end.
   * The `direction` parameter is a string that accepts either `'left'` or `'right'`, determining the direction of the rotation.
   *
   * **Important:** The gadget assumes that its input is at most 32 bits in size.
   *
   * If the input exceeds 32 bits, the gadget is invalid and fails to prove correct execution of the rotation.
   * To safely use `rotate32()`, you need to make sure that the value passed in is range-checked to 32 bits;
   * for example, using {@link GadgetsBn254.rangeCheck32}.
   *
   *
   * @param field {@link FieldBn254} element to rotate.
   * @param bits amount of bits to rotate this {@link FieldBn254} element with.
   * @param direction left or right rotation direction.
   *
   * @throws Throws an error if the input value exceeds 32 bits.
   *
   * @example
   * ```ts
   * const x = Provable.witness(FieldBn254, () => FieldBn254(0b001100));
   * const y = GadgetsBn254.rotate32(x, 2, 'left'); // left rotation by 2 bits
   * const z = GadgetsBn254.rotate32(x, 2, 'right'); // right rotation by 2 bits
   * y.assertEquals(0b110000);
   * z.assertEquals(0b000011);
   *
   * const xLarge = Provable.witness(FieldBn254, () => FieldBn254(12345678901234567890123456789012345678n));
   * GadgetsBn254.rotate32(xLarge, 32, "left"); // throws an error since input exceeds 32 bits
   * ```
   */
  rotate32(field: FieldBn254, bits: number, direction: 'left' | 'right' = 'left') {
    return rotate32(field, bits, direction);
  },
  /**
   * Bitwise XOR gadget on {@link FieldBn254} elements. Equivalent to the [bitwise XOR `^` operator in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR).
   * A XOR gate works by comparing two bits and returning `1` if two bits differ, and `0` if two bits are equal.
   *
   * This gadget builds a chain of XOR gates recursively. Each XOR gate can verify 16 bit at most. If your input elements exceed 16 bit, another XOR gate will be added to the chain.
   *
   * The `length` parameter lets you define how many bits should be compared. `length` is rounded to the nearest multiple of 16, `paddedLength = ceil(length / 16) * 16`, and both input values are constrained to fit into `paddedLength` bits. The output is guaranteed to have at most `paddedLength` bits as well.
   *
   * **Note:** Specifying a larger `length` parameter adds additional constraints.
   *
   * It is also important to mention that specifying a smaller `length` allows the verifier to infer the length of the original input data (e.g. smaller than 16 bit if only one XOR gate has been used).
   * A zkApp developer should consider these implications when choosing the `length` parameter and carefully weigh the trade-off between increased amount of constraints and security.
   *
   * **Important:** Both {@link FieldBn254} elements need to fit into `2^paddedLength - 1`. Otherwise, an error is thrown and no proof can be generated.
   *
   * For example, with `length = 2` (`paddedLength = 16`), `xor()` will fail for any input that is larger than `2**16`.
   *
   * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#xor-1)
   *
   * @param a {@link FieldBn254} element to compare.
   * @param b {@link FieldBn254} element to compare.
   * @param length amount of bits to compare.
   *
   * @throws Throws an error if the input values exceed `2^paddedLength - 1`.
   *
   * @example
   * ```ts
   * let a = FieldBn254(0b0101);
   * let b = FieldBn254(0b0011);
   *
   * let c = GadgetsBn254.xor(a, b, 4); // xor-ing 4 bits
   * c.assertEquals(0b0110);
   * ```
   */
  xor(a: FieldBn254, b: FieldBn254, length: number) {
    return xor(a, b, length);
  },

  /**
   * Bitwise NOT gate on {@link FieldBn254} elements. Similar to the [bitwise
   * NOT `~` operator in JavaScript](https://developer.mozilla.org/en-US/docs/
   * Web/JavaScript/Reference/Operators/Bitwise_NOT).
   *
   * **Note:** The NOT gate only operates over the amount
   * of bits specified by the `length` parameter.
   *
   * A NOT gate works by returning `1` in each bit position if the
   * corresponding bit of the operand is `0`, and returning `0` if the
   * corresponding bit of the operand is `1`.
   *
   * The `length` parameter lets you define how many bits to NOT.
   *
   * **Note:** Specifying a larger `length` parameter adds additional constraints. The operation will fail if the length or the input value is larger than 254.
   *
   * NOT is implemented in two different ways. If the `checked` parameter is set to `true`
   * the {@link GadgetsBn254.xor} gadget is reused with a second argument to be an
   * all one bitmask the same length. This approach needs as many rows as an XOR would need
   * for a single negation. If the `checked` parameter is set to `false`, NOT is
   * implemented as a subtraction of the input from the all one bitmask. This
   * implementation is returned by default if no `checked` parameter is provided.
   *
   * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#not)
   *
   * @example
   * ```ts
   * // not-ing 4 bits with the unchecked version
   * let a = FieldBn254(0b0101);
   * let b = GadgetsBn254.not(a,4,false);
   *
   * b.assertEquals(0b1010);
   *
   * // not-ing 4 bits with the checked version utilizing the xor gadget
   * let a = FieldBn254(0b0101);
   * let b = GadgetsBn254.not(a,4,true);
   *
   * b.assertEquals(0b1010);
   * ```
   *
   * @param a - The value to apply NOT to. The operation will fail if the value is larger than 254.
   * @param length - The number of bits to be considered for the NOT operation.
   * @param checked - Optional boolean to determine if the checked or unchecked not implementation is used. If it
   * is set to `true` the {@link GadgetsBn254.xor} gadget is reused. If it is set to `false`, NOT is implemented
   *  as a subtraction of the input from the all one bitmask. It is set to `false` by default if no parameter is provided.
   *
   * @throws Throws an error if the input value exceeds 254 bits.
   */
  not(a: FieldBn254, length: number, checked: boolean = false) {
    return not(a, length, checked);
  },

  /**
   * Performs a left shift operation on the provided {@link FieldBn254} element.
   * This operation is similar to the `<<` shift operation in JavaScript,
   * where bits are shifted to the left, and the overflowing bits are discarded.
   *
   * It’s important to note that these operations are performed considering the big-endian 64-bit representation of the number,
   * where the most significant (64th) bit is on the left end and the least significant bit is on the right end.
   *
   * **Important:** The gadgets assumes that its input is at most 64 bits in size.
   *
   * If the input exceeds 64 bits, the gadget is invalid and fails to prove correct execution of the shift.
   * Therefore, to safely use `leftShift()`, you need to make sure that the values passed in are range checked to 64 bits.
   * For example, this can be done with {@link GadgetsBn254.rangeCheck64}.
   *
   * @param field {@link FieldBn254} element to shift.
   * @param bits Amount of bits to shift the {@link FieldBn254} element to the left. The amount should be between 0 and 64 (or else the shift will fail).
   *
   * @throws Throws an error if the input value exceeds 64 bits.
   *
   * @example
   * ```ts
   * const x = Provable.witness(FieldBn254, () => FieldBn254(0b001100)); // 12 in binary
   * const y = GadgetsBn254.leftShift64(x, 2); // left shift by 2 bits
   * y.assertEquals(0b110000); // 48 in binary
   *
   * const xLarge = Provable.witness(FieldBn254, () => FieldBn254(12345678901234567890123456789012345678n));
   * leftShift64(xLarge, 32); // throws an error since input exceeds 64 bits
   * ```
   */
  leftShift64(field: FieldBn254, bits: number) {
    return leftShift64(field, bits);
  },

  /**
   * Performs a left shift operation on the provided {@link FieldBn254} element.
   * This operation is similar to the `<<` shift operation in JavaScript,
   * where bits are shifted to the left, and the overflowing bits are discarded.
   *
   * It’s important to note that these operations are performed considering the big-endian 32-bit representation of the number,
   * where the most significant (32th) bit is on the left end and the least significant bit is on the right end.
   *
   * **Important:** The gadgets assumes that its input is at most 32 bits in size.
   *
   * The output is range checked to 32 bits.
   *
   * @param field {@link FieldBn254} element to shift.
   * @param bits Amount of bits to shift the {@link FieldBn254} element to the left. The amount should be between 0 and 32 (or else the shift will fail).
   *
   * @example
   * ```ts
   * const x = Provable.witness(FieldBn254, () => FieldBn254(0b001100)); // 12 in binary
   * const y = GadgetsBn254.leftShift32(x, 2); // left shift by 2 bits
   * y.assertEquals(0b110000); // 48 in binary
   * ```
   */
  leftShift32(field: FieldBn254, bits: number) {
    return leftShift32(field, bits);
  },
  /**
   * Performs a right shift operation on the provided {@link FieldBn254} element.
   * This is similar to the `>>` shift operation in JavaScript, where bits are moved to the right.
   * The `rightShift64` function utilizes the rotation method internally to implement this operation.
   *
   * * It’s important to note that these operations are performed considering the big-endian 64-bit representation of the number,
   * where the most significant (64th) bit is on the left end and the least significant bit is on the right end.
   *
   * **Important:** The gadgets assumes that its input is at most 64 bits in size.
   *
   * If the input exceeds 64 bits, the gadget is invalid and fails to prove correct execution of the shift.
   * To safely use `rightShift64()`, you need to make sure that the value passed in is range-checked to 64 bits;
   * for example, using {@link GadgetsBn254.rangeCheck64}.
   *
   * @param field {@link FieldBn254} element to shift.
   * @param bits Amount of bits to shift the {@link FieldBn254} element to the right. The amount should be between 0 and 64 (or else the shift will fail).
   *
   * @throws Throws an error if the input value exceeds 64 bits.
   *
   * @example
   * ```ts
   * const x = Provable.witness(FieldBn254, () => FieldBn254(0b001100)); // 12 in binary
   * const y = GadgetsBn254.rightShift64(x, 2); // right shift by 2 bits
   * y.assertEquals(0b000011); // 3 in binary
   *
   * const xLarge = Provable.witness(FieldBn254, () => FieldBn254(12345678901234567890123456789012345678n));
   * rightShift64(xLarge, 32); // throws an error since input exceeds 64 bits
   * ```
   */
  rightShift64(field: FieldBn254, bits: number) {
    return rightShift64(field, bits);
  },
  /**
   * Bitwise AND gadget on {@link FieldBn254} elements. Equivalent to the [bitwise AND `&` operator in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_AND).
   * The AND gate works by comparing two bits and returning `1` if both bits are `1`, and `0` otherwise.
   *
   * It can be checked by a double generic gate that verifies the following relationship between the values below (in the process it also invokes the {@link GadgetsBn254.xor} gadget which will create additional constraints depending on `length`).
   *
   * The generic gate verifies:\
   * `a + b = sum` and the conjunction equation `2 * and = sum - xor`\
   * Where:\
   * `a + b = sum`\
   * `a ^ b = xor`\
   * `a & b = and`
   *
   * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#and)
   *
   * The `length` parameter lets you define how many bits should be compared. `length` is rounded to the nearest multiple of 16, `paddedLength = ceil(length / 16) * 16`, and both input values are constrained to fit into `paddedLength` bits. The output is guaranteed to have at most `paddedLength` bits as well.
   *
   * **Note:** Specifying a larger `length` parameter adds additional constraints.
   *
   * **Note:** Both {@link FieldBn254} elements need to fit into `2^paddedLength - 1`. Otherwise, an error is thrown and no proof can be generated.
   * For example, with `length = 2` (`paddedLength = 16`), `and()` will fail for any input that is larger than `2**16`.
   *
   * @example
   * ```typescript
   * let a = FieldBn254(3);    // ... 000011
   * let b = FieldBn254(5);    // ... 000101
   *
   * let c = GadgetsBn254.and(a, b, 2);    // ... 000001
   * c.assertEquals(1);
   * ```
   */
  and(a: FieldBn254, b: FieldBn254, length: number) {
    return and(a, b, length);
  },

  /**
   * Multi-range check.
   *
   * Proves that x, y, z are all in the range [0, 2^88).
   *
   * This takes 4 rows, so it checks 88*3/4 = 66 bits per row. This is slightly more efficient
   * than 64-bit range checks, which can do 64 bits in 1 row.
   *
   * In particular, the 3x88-bit range check supports bigints up to 264 bits, which in turn is enough
   * to support foreign field multiplication with moduli up to 2^259.
   *
   * @example
   * ```ts
   * GadgetsBn254.multiRangeCheck([x, y, z]);
   * ```
   *
   * @throws Throws an error if one of the input values exceeds 88 bits.
   */
  multiRangeCheck(limbs: Field3) {
    multiRangeCheck(limbs);
  },

  /**
   * Compact multi-range check
   *
   * This is a variant of {@link multiRangeCheck} where the first two variables are passed in
   * combined form xy = x + 2^88*y.
   *
   * The gadget
   * - splits up xy into x and y
   * - proves that xy = x + 2^88*y
   * - proves that x, y, z are all in the range [0, 2^88).
   *
   * The split form [x, y, z] is returned.
   *
   * @example
   * ```ts
   * let [x, y] = GadgetsBn254.compactMultiRangeCheck([xy, z]);
   * ```
   *
   * @throws Throws an error if `xy` exceeds 2*88 = 176 bits, or if z exceeds 88 bits.
   */
  compactMultiRangeCheck(xy: FieldBn254, z: FieldBn254) {
    return compactMultiRangeCheck(xy, z);
  },

  /**
   * GadgetsBn254 for foreign field operations.
   *
   * A _foreign field_ is a finite field different from the native field of the proof system.
   *
   * The `ForeignFieldBn254` namespace exposes operations like modular addition and multiplication,
   * which work for any finite field of size less than 2^259.
   *
   * Foreign field elements are represented as 3 limbs of native field elements.
   * Each limb holds 88 bits of the total, in little-endian order.
   *
   * All `ForeignFieldBn254` gadgets expect that their input limbs are constrained to the range [0, 2^88).
   * Range checks on outputs are added by the gadget itself.
   */
  ForeignFieldBn254: {
    /**
     * Foreign field addition: `x + y mod f`
     *
     * The modulus `f` does not need to be prime.
     *
     * Inputs and outputs are 3-tuples of native Fields.
     * Each input limb is assumed to be in the range [0, 2^88), and the gadget is invalid if this is not the case.
     * The result limbs are guaranteed to be in the same range.
     *
     * @example
     * ```ts
     * let x = Provable.witness(Field3.provable, () => Field3.from(9n));
     * let y = Provable.witness(Field3.provable, () => Field3.from(10n));
     *
     * // range check x and y
     * GadgetsBn254.multiRangeCheck(x);
     * GadgetsBn254.multiRangeCheck(y);
     *
     * // compute x + y mod 17
     * let z = ForeignFieldBn254.add(x, y, 17n);
     *
     * Provable.log(z); // ['2', '0', '0'] = limb representation of 2 = 9 + 10 mod 17
     * ```
     *
     * **Warning**: The gadget does not assume that inputs are reduced modulo f,
     * and does not prove that the result is reduced modulo f.
     * It only guarantees that the result is in the correct residue class.
     *
     * @param x left summand
     * @param y right summand
     * @param f modulus
     * @returns x + y mod f
     */
    add(x: Field3, y: Field3, f: bigint) {
      return ForeignFieldBn254.add(x, y, f);
    },

    /**
     * Foreign field subtraction: `x - y mod f`
     *
     * See {@link GadgetsBn254.ForeignFieldBn254.add} for assumptions and usage examples.
     *
     * @throws fails if `x - y < -f`, where the result cannot be brought back to a positive number by adding `f` once.
     */
    sub(x: Field3, y: Field3, f: bigint) {
      return ForeignFieldBn254.sub(x, y, f);
    },

    /**
     * Foreign field negation: `-x mod f = f - x`
     *
     * See {@link ForeignFieldBn254.add} for assumptions and usage examples.
     *
     * @throws fails if `x > f`, where `f - x < 0`.
     */
    neg(x: Field3, f: bigint) {
      return ForeignFieldBn254.negate(x, f);
    },

    /**
     * Foreign field sum: `xs[0] + signs[0] * xs[1] + ... + signs[n-1] * xs[n] mod f`
     *
     * This gadget takes a list of inputs and a list of signs (of size one less than the inputs),
     * and computes a chain of additions or subtractions, depending on the sign.
     * A sign is of type `1n | -1n`, where `1n` represents addition and `-1n` represents subtraction.
     *
     * **Note**: For 3 or more inputs, `sum()` uses fewer constraints than a sequence of `add()` and `sub()` calls,
     * because we can avoid range checks on intermediate results.
     *
     * See {@link GadgetsBn254.ForeignFieldBn254.add} for assumptions on inputs.
     *
     * @example
     * ```ts
     * let x = Provable.witness(Field3.provable, () => Field3.from(4n));
     * let y = Provable.witness(Field3.provable, () => Field3.from(5n));
     * let z = Provable.witness(Field3.provable, () => Field3.from(10n));
     *
     * // range check x, y, z
     * GadgetsBn254.multiRangeCheck(x);
     * GadgetsBn254.multiRangeCheck(y);
     * GadgetsBn254.multiRangeCheck(z);
     *
     * // compute x + y - z mod 17
     * let sum = ForeignFieldBn254.sum([x, y, z], [1n, -1n], 17n);
     *
     * Provable.log(sum); // ['16', '0', '0'] = limb representation of 16 = 4 + 5 - 10 mod 17
     * ```
     */
    sum(xs: Field3[], signs: (1n | -1n)[], f: bigint) {
      return ForeignFieldBn254.sum(xs, signs, f);
    },

    /**
     * Foreign field multiplication: `x * y mod f`
     *
     * The modulus `f` does not need to be prime, but has to be smaller than 2^259.
     *
     * **Assumptions**: In addition to the assumption that input limbs are in the range [0, 2^88), as in all foreign field gadgets,
     * this assumes an additional bound on the inputs: `x * y < 2^264 * p`, where p is the native modulus.
     * We usually assert this bound by proving that `x[2] < f[2] + 1`, where `x[2]` is the most significant limb of x.
     * To do this, we use an 88-bit range check on `2^88 - x[2] - (f[2] + 1)`, and same for y.
     * The implication is that x and y are _almost_ reduced modulo f.
     *
     * All of the above assumptions are checked by {@link GadgetsBn254.ForeignFieldBn254.assertAlmostReduced}.
     *
     * **Warning**: This gadget does not add the extra bound check on the result.
     * So, to use the result in another foreign field multiplication, you have to add the bound check on it yourself, again.
     *
     * @example
     * ```ts
     * // example modulus: secp256k1 prime
     * let f = (1n << 256n) - (1n << 32n) - 0b1111010001n;
     *
     * let x = Provable.witness(Field3.provable, () => Field3.from(f - 1n));
     * let y = Provable.witness(Field3.provable, () => Field3.from(f - 2n));
     *
     * // range check x, y and prove additional bounds x[2] <= f[2]
     * ForeignFieldBn254.assertAlmostReduced([x, y], f);
     *
     * // compute x * y mod f
     * let z = ForeignFieldBn254.mul(x, y, f);
     *
     * Provable.log(z); // ['2', '0', '0'] = limb representation of 2 = (-1)*(-2) mod f
     * ```
     */
    mul(x: Field3, y: Field3, f: bigint) {
      return ForeignFieldBn254.mul(x, y, f);
    },

    /**
     * Foreign field inverse: `x^(-1) mod f`
     *
     * See {@link GadgetsBn254.ForeignFieldBn254.mul} for assumptions on inputs and usage examples.
     *
     * This gadget adds an extra bound check on the result, so it can be used directly in another foreign field multiplication.
     */
    inv(x: Field3, f: bigint) {
      return ForeignFieldBn254.inv(x, f);
    },

    /**
     * Foreign field division: `x * y^(-1) mod f`
     *
     * See {@link GadgetsBn254.ForeignFieldBn254.mul} for assumptions on inputs and usage examples.
     *
     * This gadget adds an extra bound check on the result, so it can be used directly in another foreign field multiplication.
     *
     * @throws Different than {@link GadgetsBn254.ForeignFieldBn254.mul}, this fails on unreduced input `x`, because it checks that `x === (x/y)*y` and the right side will be reduced.
     */
    div(x: Field3, y: Field3, f: bigint) {
      return ForeignFieldBn254.div(x, y, f);
    },

    /**
     * Optimized multiplication of sums in a foreign field, for example: `(x - y)*z = a + b + c mod f`
     *
     * Note: This is much more efficient than using {@link GadgetsBn254.ForeignFieldBn254.add} and {@link GadgetsBn254.ForeignFieldBn254.sub} separately to
     * compute the multiplication inputs and outputs, and then using {@link GadgetsBn254.ForeignFieldBn254.mul} to constrain the result.
     *
     * The sums passed into this method are "lazy sums" created with {@link GadgetsBn254.ForeignFieldBn254.Sum}.
     * You can also pass in plain {@link Field3} elements.
     *
     * **Assumptions**: The assumptions on the _summands_ are analogous to the assumptions described in {@link GadgetsBn254.ForeignFieldBn254.mul}:
     * - each summand's limbs are in the range [0, 2^88)
     * - summands that are part of a multiplication input satisfy `x[2] <= f[2]`
     *
     * @throws if the modulus is so large that the second assumption no longer suffices for validity of the multiplication.
     * For small sums and moduli < 2^256, this will not fail.
     *
     * @throws if the provided multiplication result is not correct modulo f.
     *
     * @example
     * ```ts
     * // range-check x, y, z, a, b, c
     * ForeignFieldBn254.assertAlmostReduced([x, y, z], f);
     * GadgetsBn254.multiRangeCheck(a);
     * GadgetsBn254.multiRangeCheck(b);
     * GadgetsBn254.multiRangeCheck(c);
     *
     * // create lazy input sums
     * let xMinusY = ForeignFieldBn254.Sum(x).sub(y);
     * let aPlusBPlusC = ForeignFieldBn254.Sum(a).add(b).add(c);
     *
     * // assert that (x - y)*z = a + b + c mod f
     * ForeignFieldBn254.assertMul(xMinusY, z, aPlusBPlusC, f);
     * ```
     */
    assertMul(x: Field3 | Sum, y: Field3 | Sum, z: Field3 | Sum, f: bigint) {
      return ForeignFieldBn254.assertMul(x, y, z, f);
    },

    /**
     * Lazy sum of {@link Field3} elements, which can be used as input to {@link GadgetsBn254.ForeignFieldBn254.assertMul}.
     */
    Sum(x: Field3) {
      return ForeignFieldBn254.Sum(x);
    },

    /**
     * Prove that each of the given {@link Field3} elements is "almost" reduced modulo f,
     * i.e., satisfies the assumptions required by {@link GadgetsBn254.ForeignFieldBn254.mul} and other gadgets:
     * - each limb is in the range [0, 2^88)
     * - the most significant limb is less or equal than the modulus, x[2] <= f[2]
     *
     * **Note**: This method is most efficient when the number of input elements is a multiple of 3.
     *
     * @throws if any of the assumptions is violated.
     *
     * @example
     * ```ts
     * let x = Provable.witness(Field3.provable, () => Field3.from(4n));
     * let y = Provable.witness(Field3.provable, () => Field3.from(5n));
     * let z = Provable.witness(Field3.provable, () => Field3.from(10n));
     *
     * ForeignFieldBn254.assertAlmostReduced([x, y, z], f);
     *
     * // now we can use x, y, z as inputs to foreign field multiplication
     * let xy = ForeignFieldBn254.mul(x, y, f);
     * let xyz = ForeignFieldBn254.mul(xy, z, f);
     *
     * // since xy is an input to another multiplication, we need to prove that it is almost reduced again!
     * ForeignFieldBn254.assertAlmostReduced([xy], f); // TODO: would be more efficient to batch this with 2 other elements
     * ```
     */
    assertAlmostReduced(xs: Field3[], f: bigint, { skipMrc = false } = {}) {
      ForeignFieldBn254.assertAlmostReduced(xs, f, skipMrc);
    },

    /**
     * Prove that x < f for any constant f < 2^264.
     *
     * If f is a finite field modulus, this means that the given field element is fully reduced modulo f.
     * This is a stronger statement than {@link ForeignFieldBn254.assertAlmostReduced}
     * and also uses more constraints; it should not be needed in most use cases.
     *
     * **Note**: This assumes that the limbs of x are in the range [0, 2^88), in contrast to
     * {@link ForeignFieldBn254.assertAlmostReduced} which adds that check itself.
     *
     * @throws if x is greater or equal to f.
     *
     * @example
     * ```ts
     * let x = Provable.witness(Field3.provable, () => Field3.from(0x1235n));
     *
     *  // range check limbs of x
     * GadgetsBn254.multiRangeCheck(x);
     *
     * // prove that x is fully reduced mod f
     * GadgetsBn254.ForeignFieldBn254.assertLessThan(x, f);
     * ```
     */
    assertLessThan(x: Field3, f: bigint) {
      ForeignFieldBn254.assertLessThan(x, f);
    },
  },

  /**
   * Helper methods to interact with 3-limb vectors of Fields.
   *
   * **Note:** This interface does not contain any provable methods.
   */
  Field3,
  /**
   * Division modulo 2^32. The operation decomposes a {@link FieldBn254} element in the range [0, 2^64) into two 32-bit limbs, `remainder` and `quotient`, using the following equation: `n = quotient * 2^32 + remainder`.
   *
   * **Note:** The gadget acts as a proof that the input is in the range [0, 2^64). If the input exceeds 64 bits, the gadget fails.
   *
   * Asserts that both `remainder` and `quotient` are in the range [0, 2^32) using {@link GadgetsBn254.rangeCheck32}.
   *
   * @example
   * ```ts
   * let n = FieldBn254((1n << 32n) + 8n)
   * let { remainder, quotient } = GadgetsBn254.divMod32(n);
   * // remainder = 8, quotient = 1
   *
   * n.assertEquals(quotient.mul(1n << 32n).add(remainder));
   * ```
   */
  divMod32,

  /**
   * Addition modulo 2^32. The operation adds two {@link FieldBn254} elements in the range [0, 2^64] and returns the result modulo 2^32.
   *
   * Asserts that the result is in the range [0, 2^32) using {@link GadgetsBn254.rangeCheck32}.
   *
   * It uses {@link GadgetsBn254.divMod32} internally by adding the two {@link FieldBn254} elements and then decomposing the result into `remainder` and `quotient` and returning the `remainder`.
   *
   * **Note:** The gadget assumes both inputs to be in the range [0, 2^64). When called with non-range-checked inputs, be aware that the sum `a + b` can overflow the native field and the gadget can succeed but return an invalid result.
   *
   * @example
   * ```ts
   * let a = FieldBn254(8n);
   * let b = FieldBn254(1n << 32n);
   *
   * GadgetsBn254.addMod32(a, b).assertEquals(FieldBn254(8n));
   * ```
   *    */
  addMod32,

  /**
   * Implementation of the [SHA256 hash function.](https://en.wikipedia.org/wiki/SHA-2) Hash function with 256bit output.
   *
   * Applies the SHA2-256 hash function to a list of byte-sized elements.
   *
   * The function accepts {@link Bytes} as the input message, which is a type that represents a static-length list of byte-sized field elements (range-checked using {@link GadgetsBn254.rangeCheck8}).
   * Alternatively, you can pass plain `number[]`, `bigint[]` or `Uint8Array` to perform a hash outside provable code.
   *
   * Produces an output of {@link Bytes} that conforms to the chosen bit length.
   *
   * @param data - {@link Bytes} representing the message to hash.
   *
   * ```ts
   * let preimage = Bytes.fromString("hello world");
   * let digest = GadgetsBn254.SHA256.hash(preimage);
   * ```
   *
   */
  SHA256: SHA256,
};

export namespace GadgetsBn254 {
  /**
   * A 3-tuple of Fields, representing a 3-limb bigint.
   */
  export type Field3 = [FieldBn254, FieldBn254, FieldBn254];

  export namespace ForeignFieldBn254 {
    /**
     * Lazy sum of {@link Field3} elements, which can be used as input to {@link GadgetsBn254.ForeignFieldBn254.assertMul}.
     */
    export type Sum = Sum_;
  }
}
type Sum_ = Sum;
