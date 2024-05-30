import { ConstantField, Field, FieldConst, FieldVar } from '../field.ts';
import { MlArray } from './base.ts';
export { MlFieldArray, MlFieldConstArray };

type MlFieldArray = MlArray<FieldVar>;
const MlFieldArray = {
  to(arr: Field[]): MlArray<FieldVar> {
    return MlArray.to(arr.map((x) => x.value));
  },
  from([, ...arr]: MlArray<FieldVar>) {
    return arr.map((x) => new Field(x));
  },
};

type MlFieldConstArray = MlArray<FieldConst>;
const MlFieldConstArray = {
  to(arr: Field[]): MlArray<FieldConst> {
    return MlArray.to(arr.map((x) => x.toConstant().value[1]));
  },
  from([, ...arr]: MlArray<FieldConst>): ConstantField[] {
    return arr.map((x) => new Field(x) as ConstantField);
  },
};
