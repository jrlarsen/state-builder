import assert from 'node:assert';
import test from 'node:test';
import areDeepEqual from './deep-equal.js';

test("Finds two equal numbers equal", () => {
   const result = areDeepEqual(3, 3);
   assert.equal(result, true);
});
test("Finds two equal strings equal", () => {
   const result = areDeepEqual("Hello", "Hello");
   assert.equal(result, true);
});
test("Finds two equal booleans equal", () => {
   const result = areDeepEqual(true, true);
   assert.equal(result, true);
});
test("Finds two unequal numbers unequal", () => {
   const result = areDeepEqual(3, 30);
   assert.equal(result, false);
});
test("Finds two unequal strings unequal", () => {
   const result = areDeepEqual("Hell", "Hello");
   assert.equal(result, false);
});
test("Finds two unequal booleans unequal", () => {
   const result = areDeepEqual(true, false);
   assert.equal(result, false);
});

test("Finds two unequal primitives unequal", () => {
   const result = areDeepEqual(2, 3);
   assert.equal(result, false);
});

test("Finds two equal arrays equal", () => {
   const result = areDeepEqual([1, "hi", true], [1, "hi", true]);
   assert.equal(result, true);
});

test("Finds arrays of different lengths unequal", () => {
   const result = areDeepEqual([1, "hi", true], [1, "hi", true, 5]);
   assert.equal(result, false);
});

test("Finds different arrays of equal lengths unequal", () => {
   const result = areDeepEqual([1, "hi", true], [1, "hi", false]);
   assert.equal(result, false);
});

test("Finds empty arrays equal", () => {
   const result = areDeepEqual([], []);
   assert.equal(result, true);
});

test("Finds two equal arrays with nested arrays equal", () => {
   const result = areDeepEqual([1, [1, 2], [1, [3]]], [1, [1, 2], [1, [3]]]);
   assert.equal(result, true);
});

test("Finds two unequal arrays with nested arrays unequal", () => {
   const result = areDeepEqual([1, [1, 2], [1, [3]]], [1, [1, 2], [1, [3, 4]]]);
   assert.equal(result, false);
});

test("Finds empty objects equal", () => {
   const result = areDeepEqual({}, {});
   assert.equal(result, true);
});

test("Finds equal objects with primitive properties equal", () => {
   const result = areDeepEqual(
      { a: 1, b: "Hi", c: true },
      { a: 1, b: "Hi", c: true }
   );
   assert.equal(result, true);
});

test("Finds unequal objects with primitive properties unequal", () => {
   const result = areDeepEqual(
      { a: 2, b: "Hi", c: true },
      { a: 1, b: "Hi", c: true }
   );
   assert.equal(result, false);
});

test("Finds equal objects with complex properties equal", () => {
   const result = areDeepEqual(
      { a: [1, 2, 3], b: { num: 3, den: [1, 2] } },
      { a: [1, 2, 3], b: { num: 3, den: [1, 2] } },
   );
   assert.equal(result, true);
});

test("Finds unequal objects with complex properties unequal", () => {
   const result = areDeepEqual(
      { a: [1, 2, 3], b: { num: 3, den: [1, 2] } },
      { a: [1, 2, 3], b: { num: 3, den: [1, 222] } },
   );
   assert.equal(result, false);
});

test("Finds the same object equal to itself", () => {
   const obj = { a: [1, 2, 3], b: { num: 3, den: [1, 2] } };
   const result = areDeepEqual(
      obj,
      obj,
   );
   assert.equal(result, true);
});
