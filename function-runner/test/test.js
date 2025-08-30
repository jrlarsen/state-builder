import functionRunner from "../function-runner.js";
import valueFunction from "../value-function.js";

const runner = functionRunner();

const fn1 = valueFunction("a", [], () => 5);
const fn2 = valueFunction("b", [{ key: "a" }], ({ a }) => a + 1);
const fn3 = valueFunction("c", [{ key: "d" }], ({ d }) => d.num * 2);
const fn4 = valueFunction("d", [], () => ({ num: 3, den: 4 }));
const fn5 = valueFunction("e", [{ key: "d" }], ({ d }) => d.num + d.den);

const fn6 = valueFunction("f", [{ key: "g" }], ({ g }) => g);
const fn7 = valueFunction("g", [{ key: "f" }], ({ f }) => f);

const fn8 = valueFunction("h", [{ key: "a" }, { key: "b" }, { key: "c" }], ({ a, b, c }) => a + b + c);

const fn9 = valueFunction("i", [{ key: "missing" }], ({ missing }) => missing);

const fn10 = valueFunction("j", [], () => [1, 2, 3, 4, 5]);
const fn11 = valueFunction("k", [{ key: "j" }], ({ j }) => j[3]);

const fn12 = valueFunction("l", [], () => { throw new Error("Could not find value") });

runner.add(fn8);
runner.add(fn1);
runner.add(fn2);
runner.add(fn3);
runner.add(fn4);
runner.add(fn5);
runner.add(fn6);
runner.add(fn7);
runner.add(fn9);
runner.add(fn10);
runner.add(fn11);
runner.add(fn12);

const result = runner.run();

console.log(result);
