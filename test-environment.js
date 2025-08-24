import Environment from "./environment.js";
import getScanner from "./scanner.js";
import regexPatterns from "./regex-patterns.js";
import Parser from "./parser.js";
import stateBuilder from "./state-builder.js";
import getFn from "./fn-builder.js";

const valueDefs = [
   // { key: "frac.numerator", value: "int(1,10)" },
   // { key: "frac.denominator", value: "int(1,10)" },
   // { key: "a.b", value: "5" },
   // { key: "a.c.a", value: "10" },
   // { key: "a.c.e", value: "20" },
   // { key: "a.b", value: "30" },
   { key: "a", value: "5" },
   { key: "b", value: "a + 1" },
];

const scanner = { scan: getScanner(regexPatterns, ["whitespace"]) };
const parser = new Parser();
const fnBuilder = { getFn };

const env = new Environment(scanner, parser, stateBuilder, fnBuilder);

for (const def of valueDefs) {
   env.defineValue(def.key, def.value);
}

