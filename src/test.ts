import Bitmask from "./index";

import { expect } from "chai";
import "mocha";

describe("Bitmask printing", () => {
  it("should print an empty bitmask correctly", () => {
    const result = Bitmask.Print(0);
    expect(result).to.equal("00000000000000000000000000000000");
  });

  it("should print a non-empty bitmask correctly", () => {
    const result = Bitmask.Print(1400281376);
    expect(result).to.equal("01010011011101101001100100100000");
  });
});

describe("Bitmask creation and retrieval", () => {
  it("should throw an error when trying to use too many bits", () => {
    expect(() => new Bitmask([
      { name: "a", length: 16 },
      { name: "b", length: 17 }
    ])).to.throw(Error);
  });

  const testBitmask = new Bitmask([
    { name: "section1", length: 2 },
    { name: "section2", length: 3 },
    { name: "section3", length: 4 },
    { name: "section4", length: 5 },
    { name: "section5", length: 6 },
    { name: "section6", length: 12 }
  ]);

  it("should throw an error when a property value is too large", () => {

  });

  // We need to be careful to test only the public API and not enforce
  // specific layouts, as it's possible that different layouts may
  // improve performance. Thus, we'll only test that storing then
  // retrieving works correctly, not that it creates a specific value.
  it("should create and deconstruct a bitmask value correctly", () => {
    const value = testBitmask.create({
      "section1": 3,
      "section2": 5,
      "section3": 12,
      "section4": 25,
      "section5": 60,
      "section6": 4000
    });

    expect(testBitmask.getSection(value, "section1")).to.equal(3);
    expect(testBitmask.getSection(value, "section2")).to.equal(5);
    expect(testBitmask.getSection(value, "section3")).to.equal(12);
    expect(testBitmask.getSection(value, "section4")).to.equal(25);
    expect(testBitmask.getSection(value, "section5")).to.equal(60);
    expect(testBitmask.getSection(value, "section6")).to.equal(4000);

    const deconstructedValue = testBitmask.toObject(value);
    expect(deconstructedValue).to.deep.equal({
      "section1": 3,
      "section2": 5,
      "section3": 12,
      "section4": 25,
      "section5": 60,
      "section6": 4000
    });
  });
});
