import Environment from "./environment.js";
import getScanner from "./scanner.js";
import regexPatterns from "./regex-patterns.js";
import Parser from "./parser.js";
import stateBuilder from "./state-builder.js";
import getFn from "./fn-builder.js";

const valueDefs = [
   { key: "a.n", value: "5" },
   { key: "a.d", value: "7" },
   { key: "b", value: "[2 * a.n, pow(a.d, 2), a.n + a.d]" },
];

const scanner = { scan: getScanner(regexPatterns, ["whitespace"]) };
const parser = new Parser();
const fnBuilder = { getFn };

const env = new Environment(scanner, parser, stateBuilder, fnBuilder);

for (const def of valueDefs) {
   env.defineValue(def.key, def.value);
}
