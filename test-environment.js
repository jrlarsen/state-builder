import Environment from "./environment.js";
import getScanner from "./scanner.js";
import regexPatterns from "./regex-patterns.js";
import Parser from "./parser.js";
import stateBuilder from "./state-builder.js";
import getFn from "./fn-builder.js";

const valueDefs = [
   { key: "a", value: "int(1, 10) * 4" },
   { key: "b", value: "int(1, 10) * 6" },
   { key: "c", value: "int(1, 100) * 5" },
   { key: "d", value: "int(1, 100) * 3" },
];

const scanner = { scan: getScanner(regexPatterns, ["whitespace"]) };
const parser = new Parser();
const fnBuilder = { getFn };

const env = new Environment(scanner, parser, stateBuilder, fnBuilder);

for (const def of valueDefs) {
   env.defineValue(def.key, def.value);
}

env.defineFunction(
   "hcf",
   ["a", "b"],
   [
      { key: "c", fn: "max(a, b) - min(a, b)" },
      { key: "b", fn: "min(a, b)" },
      { key: "a", fn: "c" },
   ],
   "min(a, b)",
   "a != b && a != 1"
);

env.defineValue("hcf1", "hcf(a, b)");
env.defineValue("hcf2", "hcf(c, d)");

console.table(env.getState());
