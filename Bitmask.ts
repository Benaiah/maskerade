/* tslint:disable:no-bitwise */

// Swap these two definitions to toggle assertions
const assert = (condition: boolean, message?: string) => { return; };

// const assert = (condition: boolean, message?: string) => {
//   if (!condition) {
//     const errorMessage = (message !== undefined)
//       ? "Assertion failed"
//       : message;
//     throw new Error(errorMessage);
//   }
// };

/*
  JS uses signed 32-bit integers in "two's complement format". We
  just care about the bits, so we can ignore the number format. This
  gives us the following space to work with:

  00000000 00000000 00000000 00000000

  In order to check the value of a specific section, we do a bitwise
  AND with a value that masks out everything but the region we"re
  interested in. If we simply need it for comparison, this is already
  enough - we can simple check `value === desiredValue`. If we wish to
  get the value of that specific field as an (unsigned) number, we
  must do one additional step: we zero-fill right shift the requisite
  number of places to move the value to the zero place.

  The Bitmask class is used to abstract bitmask access and creation.
  It adds overhead, but for the majority of cases that shouldn"t be a
  problem. In cases where we require the most performance we can
  always do the bitwise operations manually.

  NB: I don't like that the data sections are stringly typed, but as
  far as I can tell there's no way to use something like an enum with
  TypeScript's current type system. This isn't too bad, as Bitmask
  should probably be wrapped somehow anyway, so the stringly-typing
  should stay fairly confined.
*/

const range = (num: number): number[] => {
  return Array.apply(null, Array(num)).map((_, i) => i);
};

export interface ISection {
  name: string;
  length: number;
}

type BitmaskInternalSection = {
  mask: number,
  name: string,
  length: number,
  start: number,
};

export class Bitmask {
  public static Print(num: number): string {
    const places = 32;
    const len = num.toString(2).length;
    const zeroes = places - len + 1;
    return Array(+(zeroes > 0 && zeroes)).join("0") + num.toString(2);
  }

  // This gets a number filled with zeroes except for the desired
  // section, to be used as an AND mask to get a specific part of the
  // bitmask.
  public static GetIsolationMask(pos, len): number {
    return range(len).reduce((a, b) => a + Math.pow(2, b + pos), 0);
  }

  public readonly used: number;
  public readonly free: number;
  public readonly sections: BitmaskInternalSection[];
  public readonly sectionsByName: { [name: string]: BitmaskInternalSection };

  constructor(sections: ISection[]) {
    this.used = sections.reduce((result, section) => result + section.length, 0);
    assert(this.used <= 32, "Bitmasks cannot have more than 32 bits.");
    this.free = 32 - this.used;

    this.sectionsByName = {};
    this.sections = sections.reduce((result, section) => {
      return {
        currentlyAt: result.currentlyAt + section.length,
        sections: [...result.sections, {
          length: section.length,
          mask: Bitmask.GetIsolationMask(result.currentlyAt, section.length),
          name: section.name,
          start: result.currentlyAt,
        }],
      };
    }, { currentlyAt: 0, sections: [] }).sections;

    this.sectionsByName = this.sections.reduce((result, section) => {
      result[section.name] = section;
      return result;
    }, {});
  }

  public create(values: { [sectionName: string]: number }): number {
    return this.sections.reduce((result, section) => {
      const val = values[section.name];
      assert(Math.pow(2, section.length) >= val, "Value too large for data section.");
      const valueAtPosition = val << section.start;
      return result | valueAtPosition;
    }, 0);
  }

  public getSection(val: number, sectionName: string): number {
    const mask = this.sectionsByName[sectionName].mask;
    const start = this.sectionsByName[sectionName].start;

    return ((val & mask) >>> start);
  }

  public toObject(val: number): any {
    return this.sections.reduce((result, section) => {
      let newObj = {};
      newObj[section.name] = this.getSection(val, section.name);
      return Object.assign(result, newObj);
    }, {});
  }
}

export default Bitmask;
