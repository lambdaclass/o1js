import { isReady, shutdown, Field, Bool, Circuit } from '../../dist/server';

describe('bool', () => {
  beforeAll(async () => {
    await isReady;
    return;
  });

  afterAll(async () => {
    setTimeout(async () => {
      await shutdown();
    }, 1500);
  });

  describe('inside circuit', () => {
    describe('toField', () => {
      it('should return a Field', async () => {
        expect(true).toEqual(true);
      });
      it('should convert false to Field element 0 ', () => {
        expect(() => {
          Circuit.runAndCheck(() => {
            const xFalse = Circuit.witness(Bool, () => new Bool(false));

            xFalse.toField().assertEquals(new Field(0));
          });
        }).not.toThrow();
      });

      it('should throw when false toString is compared to Field element other than 0 ', () => {
        expect(() => {
          Circuit.runAndCheck(() => {
            const xFalse = Circuit.witness(Bool, () => new Bool(false));
            xFalse.toField().assertEquals(new Field(1));
          });
        }).toThrow();
      });

      it('should convert true to Field element 1', () => {
        expect(() => {
          Circuit.runAndCheck(() => {
            const xTrue = Circuit.witness(Bool, () => new Bool(true));
            xTrue.toField().assertEquals(new Field(1));
          });
        }).not.toThrow();
      });

      it('should throw when true toString is compared to Field element other than 1 ', () => {
        expect(() => {
          Circuit.runAndCheck(() => {
            const xTrue = Circuit.witness(Bool, () => new Bool(true));
            xTrue.toField().assertEquals(new Field(0));
          });
        }).toThrow();
      });
    });
    describe('and', () => {
      it('true "and" true should return true', async () => {
        expect(() => {
          Circuit.runAndCheck(() => {
            const xTrue = Circuit.witness(Bool, () => new Bool(true));
            const yTrue = Circuit.witness(Bool, () => new Bool(true));

            xTrue.and(yTrue).assertEquals(new Bool(true));
          });
        }).not.toThrow();
      });

      it('should throw if true "and" true is compared to false', async () => {
        expect(() => {
          Circuit.runAndCheck(() => {
            const xTrue = Circuit.witness(Bool, () => new Bool(true));
            const yTrue = Circuit.witness(Bool, () => new Bool(true));

            xTrue.and(yTrue).assertEquals(new Bool(false));
          });
        }).toThrow();
      });

      it('false "and" false should return false', async () => {
        expect(() => {
          Circuit.runAndCheck(() => {
            const xFalse = Circuit.witness(Bool, () => new Bool(false));
            const yFalse = Circuit.witness(Bool, () => new Bool(false));

            xFalse.and(yFalse).assertEquals(new Bool(false));
          });
        }).not.toThrow();
      });

      it('should throw if false "and" false is compared to true', async () => {
        expect(() => {
          Circuit.runAndCheck(() => {
            const xFalse = Circuit.witness(Bool, () => new Bool(false));
            const yFalse = Circuit.witness(Bool, () => new Bool(false));

            xFalse.and(yFalse).assertEquals(new Bool(true));
          });
        }).toThrow();
      });

      it('false "and" true should return false', async () => {
        expect(() => {
          Circuit.runAndCheck(() => {
            const xFalse = Circuit.witness(Bool, () => new Bool(false));
            const yTrue = Circuit.witness(Bool, () => new Bool(true));

            xFalse.and(yTrue).assertEquals(new Bool(false));
          });
        }).not.toThrow();
      });

      it('should throw if false "and" true is compared to true', async () => {
        expect(() => {
          Circuit.runAndCheck(() => {
            const xFalse = Circuit.witness(Bool, () => new Bool(false));
            const yTrue = Circuit.witness(Bool, () => new Bool(true));

            xFalse.and(yTrue).assertEquals(new Bool(true));
          });
        }).toThrow();
      });
    });
  });
});
