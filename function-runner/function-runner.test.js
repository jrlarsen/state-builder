import assert from 'node:assert';
import test from 'node:test';
import functionRunner from "./function-runner.js";
import valueFunction from "./value-function.js";

test("Result is of correct form", () => {
   const runner = functionRunner();
   const fn = valueFunction("a", [], () => 5);
   runner.add(fn);
   const result = runner.run();
   const expected = { a: { key: "a", status: "ok", value: 5 } };

   assert.deepEqual(expected, result);
});

test("Can set a simple value", () => {
   const runner = functionRunner();
   const fn = valueFunction("a", [], () => 5);
   runner.add(fn);
   const state = runner.run();
   const result = state.a.value;
   const expected = 5;

   assert.deepEqual(expected, result);
});

test("Can depend on a single value", () => {
   const runner = functionRunner();
   const fn1 = valueFunction("a", [], () => 5);
   const fn2 = valueFunction("b", ["a"], ({ a }) => a + 1);
   runner.add(fn1);
   runner.add(fn2);
   const state = runner.run();
   const result = state.b.value;
   const expected = 6;

   assert.equal(expected, result);
});

test("Can depend on a later value", () => {
   const runner = functionRunner();
   const fn1 = valueFunction("a", [], () => 5);
   const fn2 = valueFunction("b", ["a"], ({ a }) => a + 1);

   runner.add(fn2); // add 'b' first
   runner.add(fn1);

   const state = runner.run();
   const result = state.b.value;
   const expected = 6;

   assert.equal(expected, result);
});

test("Can depend on object properties", () => {
   const runner = functionRunner();
   const fn1 = valueFunction("a", [], () => ({ first: 1, second: 1 }));
   const fn2 = valueFunction("b", ["a"], ({ a }) => a.first + a.second);

   runner.add(fn1);
   runner.add(fn2);

   const state = runner.run();
   const result = state.b.value;
   const expected = 2;

   assert.equal(expected, result);
});

test("Can depend on a multiple values", () => {
   const runner = functionRunner();
   const fn1 = valueFunction("a", [], () => 5);
   const fn2 = valueFunction("b", [], () => 10);
   const fn3 = valueFunction("c", ["a", "b"], ({ a, b }) => a + b);
   runner.add(fn1);
   runner.add(fn2);
   runner.add(fn3);
   const state = runner.run();
   const result = state.c.value;
   const expected = 15;

   assert.equal(expected, result);
});

test("Will exclude a given value", () => {
   const runner = functionRunner();
   const fn1 = valueFunction(
      "a",
      [],
      () => Math.floor(Math.random() * 2) + 4, // 4 or 5
      [4]
   );
   runner.add(fn1);
   const state = runner.run();
   const result = state.a.value;
   const expected = 5;

   assert.equal(expected, result);
})

test("Will exclude a given object", () => {
   const runner = functionRunner();
   const possibles = [{ a: 5, b: "Hi" }, { a: 4, b: "Hi" }];
   const fn1 = valueFunction(
      "a",
      [],
      () => possibles[Math.floor(Math.random() * 2)],
      [{ a: 5, b: "Hi" }]
   );
   runner.add(fn1);
   const state = runner.run();
   const result = state.a.value;
   const expected = { a: 4, b: "Hi" };

   assert.deepEqual(expected, result);
});

test("Will exclude an array of given values", () => {
   const runner = functionRunner();
   const fn1 = valueFunction(
      "a",
      [],
      () => Math.floor(Math.random() * 4) + 4, // 4, 5, 6, 7
      [4, 6, 7]
   );
   runner.add(fn1);
   const state = runner.run();
   const result = state.a.value;
   const expected = 5;

   assert.equal(expected, result);
})
