import assert from 'node:assert';
import test from 'node:test';
import stateBuilder from "./state-builder.js";
import valueGetter from "./value-getter.js";

test("Result is of correct form", () => {
   const builder = stateBuilder();
   const fn = valueGetter("a", [], () => 5);
   builder.add(fn);
   const result = builder.build();
   const expected = { a: { key: "a", status: "ok", value: 5 } };

   assert.deepEqual(expected, result);
});

test("Can set a simple value", () => {
   const builder = stateBuilder();
   const fn = valueGetter("a", [], () => 5);
   builder.add(fn);
   const state = builder.build();
   const result = state.a.value;
   const expected = 5;

   assert.deepEqual(expected, result);
});

test("Can depend on a single value", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter("a", [], () => 5);
   const fn2 = valueGetter("b", ["a"], ({ a }) => a + 1);
   builder.add(fn1);
   builder.add(fn2);
   const state = builder.build();
   const result = state.b.value;
   const expected = 6;

   assert.equal(expected, result);
});

test("Can depend on a later value", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter("a", [], () => 5);
   const fn2 = valueGetter("b", ["a"], ({ a }) => a + 1);

   builder.add(fn2); // add 'b' first
   builder.add(fn1);

   const state = builder.build();
   const result = state.b.value;
   const expected = 6;

   assert.equal(expected, result);
});

test("Can depend on object properties", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter("a", [], () => ({ first: 1, second: 1 }));
   const fn2 = valueGetter("b", ["a"], ({ a }) => a.first + a.second);

   builder.add(fn1);
   builder.add(fn2);

   const state = builder.build();
   const result = state.b.value;
   const expected = 2;

   assert.equal(expected, result);
});

test("Can depend on a multiple values", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter("a", [], () => 5);
   const fn2 = valueGetter("b", [], () => 10);
   const fn3 = valueGetter("c", ["a", "b"], ({ a, b }) => a + b);
   builder.add(fn1);
   builder.add(fn2);
   builder.add(fn3);
   const state = builder.build();
   const result = state.c.value;
   const expected = 15;

   assert.equal(expected, result);
});

test("Will exclude a given value", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter(
      "a",
      [],
      () => Math.floor(Math.random() * 2) + 4, // 4 or 5
      [4]
   );
   builder.add(fn1);
   const state = builder.build();
   const result = state.a.value;
   const expected = 5;

   assert.equal(expected, result);
})

test("Will exclude a given object", () => {
   const builder = stateBuilder();
   const possibles = [{ a: 5, b: "Hi" }, { a: 4, b: "Hi" }];
   const fn1 = valueGetter(
      "a",
      [],
      () => possibles[Math.floor(Math.random() * 2)],
      [{ a: 5, b: "Hi" }]
   );
   builder.add(fn1);
   const state = builder.build();
   const result = state.a.value;
   const expected = { a: 4, b: "Hi" };

   assert.deepEqual(expected, result);
});

test("Will exclude an array of given values", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter(
      "a",
      [],
      () => Math.floor(Math.random() * 4) + 4, // 4, 5, 6, 7
      [4, 6, 7]
   );
   builder.add(fn1);
   const state = builder.build();
   const result = state.a.value;
   const expected = 5;

   assert.equal(expected, result);
});

test("Will create error value for a missing dependency", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter(
      "a",
      ["b"],
      ({ b }) => b
   );
   builder.add(fn1);
   const state = builder.build();
   const result = state.a.value;
   const expected = 'This value, a, depends on 1 missing value: (b).';

   assert.equal(expected, result);
});

test("Will create error value for an error dependency", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter(
      "a",
      ["b"],
      ({ b }) => b
   );
   const fn2 = valueGetter(
      "c",
      ["a"],
      ({ a }) => a
   );
   builder.add(fn1);
   builder.add(fn2);
   const state = builder.build();
   const result = state.c.value;
   const expected = 'This value, c, depends on 1 value with errors: (a).';

   assert.equal(expected, result);
});

test("Will create error value for multiple dependency errors", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter(
      "a",
      ["b"],
      ({ b }) => b
   );
   const fn2 = valueGetter(
      "c",
      ["a"],
      ({ a }) => a
   );
   const fn3 = valueGetter(
      "d",
      ["a", "b", "no"],
      ({ a, b }) => a + b
   );
   builder.add(fn1);
   builder.add(fn2);
   builder.add(fn3);
   const state = builder.build();
   const result = state.d.value;
   const expected = 'This value, d, depends on 2 missing values: (b, no) and 1 value with errors: (a).';

   assert.equal(expected, result);
});

test("Will create error value for an impossible exclusion", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter(
      "a",
      [],
      () => 5,
      [5]
   );
   builder.add(fn1);
   const state = builder.build();
   const result = state.a.value;
   const expected = 'There was a problem calculating this value, a: The value was too hard to generate.';

   assert.equal(expected, result);
});

test("Will return a list of a given length", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter(
      "a",
      [],
      () => 5,
      [],
      { length: 3 }
   );
   builder.add(fn1);
   const state = builder.build();
   const result = state.a.value;
   const expected = [5, 5, 5];

   assert.deepEqual(expected, result);
});

test("Will return a list of unique items of a given length", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter(
      "a",
      [],
      () => Math.floor(Math.random() * 4) + 1,
      [],
      { length: 4, unique: true }
   );
   builder.add(fn1);
   const state = builder.build();
   const result = state.a.value.sort();
   const expected = [1, 2, 3, 4];

   assert.deepEqual(expected, result);
});

test("Will return an error for a list with too many exclusions", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter(
      "a",
      [],
      () => Math.floor(Math.random() * 4) + 1,
      [1],
      { length: 4, unique: true }
   );
   builder.add(fn1);
   const state = builder.build();
   const result = state.a.value;
   const expected =  'There was a problem calculating this value, a: The value was too hard to generate.';

   assert.equal(expected, result);
});

test("Can use index when creating lists", () => {
   const builder = stateBuilder();
   const fn1 = valueGetter(
      "a",
      ["_i"],
      ({ _i }) => _i,
      [],
      { length: 4 }
   );
   builder.add(fn1);
   const state = builder.build();
   const result = state.a.value;
   const expected =  [0, 1, 2, 3];

   assert.deepEqual(expected, result);
});
