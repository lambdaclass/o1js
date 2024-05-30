import { Snarky } from '../snarky.js';
import { FieldConst, type FieldBn254 } from './field-bn254.ts';
import { exists } from './gadgets/common-bn254.ts';
import { MlArray, MlTuple } from './ml/base.ts';
import { TupleN } from './util/types.ts';

export {
  GatesBn254,
  rangeCheck0,
  rangeCheck1,
  xor,
  zero,
  rotate,
  generic,
  foreignFieldAdd,
  foreignFieldMul,
  KimchiGateType,
};

const GatesBn254 = {
  rangeCheck0,
  rangeCheck1,
  xor,
  zero,
  rotate,
  generic,
  foreignFieldAdd,
  foreignFieldMul,
  raw,
};

function rangeCheck0(
  x: FieldBn254,
  xLimbs12: TupleN<FieldBn254, 6>,
  xLimbs2: TupleN<FieldBn254, 8>,
  isCompact: boolean
) {
  Snarky.bn254.gates.rangeCheck0(
    x.value,
    MlTuple.mapTo(xLimbs12, (x) => x.value),
    MlTuple.mapTo(xLimbs2, (x) => x.value),
    isCompact ? FieldConst[1] : FieldConst[0]
  );
}

/**
 * the rangeCheck1 gate is used in combination with the rangeCheck0,
 * for doing a 3x88-bit range check
 */
function rangeCheck1(
  v2: FieldBn254,
  v12: FieldBn254,
  vCurr: TupleN<FieldBn254, 13>,
  vNext: TupleN<FieldBn254, 15>
) {
  Snarky.bn254.gates.rangeCheck1(
    v2.value,
    v12.value,
    MlTuple.mapTo(vCurr, (x) => x.value),
    MlTuple.mapTo(vNext, (x) => x.value)
  );
}

function rotate(
  field: FieldBn254,
  rotated: FieldBn254,
  excess: FieldBn254,
  limbs: [FieldBn254, FieldBn254, FieldBn254, FieldBn254],
  crumbs: [FieldBn254, FieldBn254, FieldBn254, FieldBn254, FieldBn254, FieldBn254, FieldBn254, FieldBn254],
  two_to_rot: bigint
) {
  Snarky.bn254.gates.rotate(
    field.value,
    rotated.value,
    excess.value,
    MlArray.to(limbs.map((x) => x.value)),
    MlArray.to(crumbs.map((x) => x.value)),
    FieldConst.fromBigint(two_to_rot)
  );
}

/**
 * Asserts that 16 bit limbs of input two elements are the correct XOR output
 */
function xor(
  input1: FieldBn254,
  input2: FieldBn254,
  outputXor: FieldBn254,
  in1_0: FieldBn254,
  in1_1: FieldBn254,
  in1_2: FieldBn254,
  in1_3: FieldBn254,
  in2_0: FieldBn254,
  in2_1: FieldBn254,
  in2_2: FieldBn254,
  in2_3: FieldBn254,
  out0: FieldBn254,
  out1: FieldBn254,
  out2: FieldBn254,
  out3: FieldBn254
) {
  Snarky.bn254.gates.xor(
    input1.value,
    input2.value,
    outputXor.value,
    in1_0.value,
    in1_1.value,
    in1_2.value,
    in1_3.value,
    in2_0.value,
    in2_1.value,
    in2_2.value,
    in2_3.value,
    out0.value,
    out1.value,
    out2.value,
    out3.value
  );
}

/**
 * [Generic gate](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=foreignfield#double-generic-gate)
 * The vanilla PLONK gate that allows us to do operations like:
 * * addition of two registers (into an output register)
 * * multiplication of two registers
 * * equality of a register with a constant
 *
 * More generally, the generic gate controls the coefficients (denoted `c_`) in the equation:
 *
 * `c_l*l + c_r*r + c_o*o + c_m*l*r + c_c === 0`
 */
function generic(
  coefficients: {
    left: bigint;
    right: bigint;
    out: bigint;
    mul: bigint;
    const: bigint;
  },
  inputs: { left: FieldBn254; right: FieldBn254; out: FieldBn254 }
) {
  Snarky.bn254.gates.generic(
    FieldConst.fromBigint(coefficients.left),
    inputs.left.value,
    FieldConst.fromBigint(coefficients.right),
    inputs.right.value,
    FieldConst.fromBigint(coefficients.out),
    inputs.out.value,
    FieldConst.fromBigint(coefficients.mul),
    FieldConst.fromBigint(coefficients.const)
  );
}

function zero(a: FieldBn254, b: FieldBn254, c: FieldBn254) {
  raw(KimchiGateType.Zero, [a, b, c], []);
}

/**
 * bigint addition which allows for field overflow and carry
 *
 * - `l01 + sign*r01 - overflow*f01 - carry*2^2l === r01`
 * - `l2  + sign*r2  - overflow*f2  + carry      === r2`
 * - overflow is 0 or sign
 * - carry is 0, 1 or -1
 *
 * assumes that the result is placed in the first 3 cells of the next row!
 */
function foreignFieldAdd({
  left,
  right,
  overflow,
  carry,
  modulus,
  sign,
}: {
  left: TupleN<FieldBn254, 3>;
  right: TupleN<FieldBn254, 3>;
  overflow: FieldBn254;
  carry: FieldBn254;
  modulus: TupleN<bigint, 3>;
  sign: 1n | -1n;
}) {
  Snarky.bn254.gates.foreignFieldAdd(
    MlTuple.mapTo(left, (x) => x.value),
    MlTuple.mapTo(right, (x) => x.value),
    overflow.value,
    carry.value,
    MlTuple.mapTo(modulus, FieldConst.fromBigint),
    FieldConst.fromBigint(sign)
  );
}

/**
 * Foreign field multiplication
 */
function foreignFieldMul(inputs: {
  left: TupleN<FieldBn254, 3>;
  right: TupleN<FieldBn254, 3>;
  remainder: TupleN<FieldBn254, 2>;
  quotient: TupleN<FieldBn254, 3>;
  quotientHiBound: FieldBn254;
  product1: TupleN<FieldBn254, 3>;
  carry0: FieldBn254;
  carry1p: TupleN<FieldBn254, 7>;
  carry1c: TupleN<FieldBn254, 4>;
  foreignFieldModulus2: bigint;
  negForeignFieldModulus: TupleN<bigint, 3>;
}) {
  let {
    left,
    right,
    remainder,
    quotient,
    quotientHiBound,
    product1,
    carry0,
    carry1p,
    carry1c,
    foreignFieldModulus2,
    negForeignFieldModulus,
  } = inputs;

  Snarky.bn254.gates.foreignFieldMul(
    MlTuple.mapTo(left, (x) => x.value),
    MlTuple.mapTo(right, (x) => x.value),
    MlTuple.mapTo(remainder, (x) => x.value),
    MlTuple.mapTo(quotient, (x) => x.value),
    quotientHiBound.value,
    MlTuple.mapTo(product1, (x) => x.value),
    carry0.value,
    MlTuple.mapTo(carry1p, (x) => x.value),
    MlTuple.mapTo(carry1c, (x) => x.value),
    FieldConst.fromBigint(foreignFieldModulus2),
    MlTuple.mapTo(negForeignFieldModulus, FieldConst.fromBigint)
  );
}

function raw(kind: KimchiGateType, values: FieldBn254[], coefficients: bigint[]) {
  let n = values.length;
  let padding = exists(15 - n, () => Array(15 - n).fill(0n));
  Snarky.bn254.gates.raw(
    kind,
    MlArray.to(values.concat(padding).map((x) => x.value)),
    MlArray.to(coefficients.map(FieldConst.fromBigint))
  );
}

enum KimchiGateType {
  Zero,
  Generic,
  Poseidon,
  CompleteAdd,
  VarBaseMul,
  EndoMul,
  EndoMulScalar,
  Lookup,
  CairoClaim,
  CairoInstruction,
  CairoFlags,
  CairoTransition,
  RangeCheck0,
  RangeCheck1,
  ForeignFieldAdd,
  ForeignFieldMul,
  Xor16,
  Rot64,
}
