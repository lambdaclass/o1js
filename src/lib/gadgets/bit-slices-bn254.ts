/**
 * Gadgets for converting between field elements and bit slices of various lengths
 */
import { bigIntToBits } from '../../bindings/crypto/bigint-helpers.js';
import { BoolBn254 } from '../bool-bn254.js';
import { FieldBn254 } from '../field-bn254.js';
import { UInt8 } from '../int.js';
import { ProvableBn254 } from '../provable-bn254.js';
import { chunk } from '../util/arrays.js';
import { assert, exists } from './common-bn254.js';
import type { Field3 } from './foreign-field-bn254.js';
import { l } from './range-check-bn254.js';

export { bytesToWord, wordToBytes, wordsToBytes, bytesToWords, sliceField3 };

// conversion between bytes and multi-byte words

/**
 * Convert an array of UInt8 to a FieldBn254 element. Expects little endian representation.
 */
function bytesToWord(wordBytes: UInt8[]): FieldBn254 {
  return wordBytes.reduce((acc, byte, idx) => {
    const shift = 1n << BigInt(8 * idx);
    return acc.add(byte.value.mul(shift));
  }, FieldBn254.from(0));
}

/**
 * Convert a FieldBn254 element to an array of UInt8. Expects little endian representation.
 * @param bytesPerWord number of bytes per word
 */
function wordToBytes(word: FieldBn254, bytesPerWord = 8): UInt8[] {
  let bytes = ProvableBn254.witness(ProvableBn254.Array(UInt8, bytesPerWord), () => {
    let w = word.toBigInt();
    return Array.from({ length: bytesPerWord }, (_, k) =>
      UInt8.from((w >> BigInt(8 * k)) & 0xffn)
    );
  });

  // check decomposition
  bytesToWord(bytes).assertEquals(word);

  return bytes;
}

/**
 * Convert an array of FieldBn254 elements to an array of UInt8. Expects little endian representation.
 * @param bytesPerWord number of bytes per word
 */
function wordsToBytes(words: FieldBn254[], bytesPerWord = 8): UInt8[] {
  return words.flatMap((w) => wordToBytes(w, bytesPerWord));
}
/**
 * Convert an array of UInt8 to an array of FieldBn254 elements. Expects little endian representation.
 * @param bytesPerWord number of bytes per word
 */
function bytesToWords(bytes: UInt8[], bytesPerWord = 8): FieldBn254[] {
  return chunk(bytes, bytesPerWord).map(bytesToWord);
}

// conversion between 3-limb foreign fields and arbitrary bit slices

/**
 * ProvableBn254 method for slicing a 3x88-bit bigint into smaller bit chunks of length `chunkSize`
 *
 * This serves as a range check that the input is in [0, 2^maxBits)
 */
function sliceField3(
  [x0, x1, x2]: Field3,
  { maxBits, chunkSize }: { maxBits: number; chunkSize: number }
) {
  let l_ = Number(l);
  assert(maxBits <= 3 * l_, `expected max bits <= 3*${l_}, got ${maxBits}`);

  // first limb
  let result0 = sliceField(x0, Math.min(l_, maxBits), chunkSize);
  if (maxBits <= l_) return result0.chunks;
  maxBits -= l_;

  // second limb
  let result1 = sliceField(x1, Math.min(l_, maxBits), chunkSize, result0);
  if (maxBits <= l_) return result0.chunks.concat(result1.chunks);
  maxBits -= l_;

  // third limb
  let result2 = sliceField(x2, maxBits, chunkSize, result1);
  return result0.chunks.concat(result1.chunks, result2.chunks);
}

/**
 * ProvableBn254 method for slicing a field element into smaller bit chunks of length `chunkSize`.
 *
 * This serves as a range check that the input is in [0, 2^maxBits)
 *
 * If `chunkSize` does not divide `maxBits`, the last chunk will be smaller.
 * We return the number of free bits in the last chunk, and optionally accept such a result from a previous call,
 * so that this function can be used to slice up a bigint of multiple limbs into homogeneous chunks.
 *
 * TODO: atm this uses expensive boolean checks for each bit.
 * For larger chunks, we should use more efficient range checks.
 */
function sliceField(
  x: FieldBn254,
  maxBits: number,
  chunkSize: number,
  leftover?: { chunks: FieldBn254[]; leftoverSize: number }
) {
  let bits = exists(maxBits, () => {
    let bits = bigIntToBits(x.toBigInt());
    // normalize length
    if (bits.length > maxBits) bits = bits.slice(0, maxBits);
    if (bits.length < maxBits)
      bits = bits.concat(Array(maxBits - bits.length).fill(false));
    return bits.map(BigInt);
  });

  let chunks = [];
  let sum = FieldBn254.from(0n);

  // if there's a leftover chunk from a previous sliceField() call, we complete it
  if (leftover !== undefined) {
    let { chunks: previous, leftoverSize: size } = leftover;
    let remainingChunk = FieldBn254.from(0n);
    for (let i = 0; i < size; i++) {
      let bit = bits[i];
      BoolBn254.check(BoolBn254.Unsafe.ofField(bit));
      remainingChunk = remainingChunk.add(bit.mul(1n << BigInt(i)));
    }
    sum = remainingChunk = remainingChunk.seal();
    let chunk = previous[previous.length - 1];
    previous[previous.length - 1] = chunk.add(
      remainingChunk.mul(1n << BigInt(chunkSize - size))
    );
  }

  let i = leftover?.leftoverSize ?? 0;
  for (; i < maxBits; i += chunkSize) {
    // prove that chunk has `chunkSize` bits
    // TODO: this inner sum should be replaced with a more efficient range check when possible
    let chunk = FieldBn254.from(0n);
    let size = Math.min(maxBits - i, chunkSize); // last chunk might be smaller
    for (let j = 0; j < size; j++) {
      let bit = bits[i + j];
      BoolBn254.check(BoolBn254.Unsafe.ofField(bit));
      chunk = chunk.add(bit.mul(1n << BigInt(j)));
    }
    chunk = chunk.seal();
    // prove that chunks add up to x
    sum = sum.add(chunk.mul(1n << BigInt(i)));
    chunks.push(chunk);
  }
  sum.assertEquals(x);

  let leftoverSize = i - maxBits;
  return { chunks, leftoverSize } as const;
}
