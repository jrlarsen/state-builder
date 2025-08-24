import Environment from "./environment.js";
import getScanner from "./scanner.js";
import regexPatterns from "./regex-patterns.js";
import Parser from "./parser.js";
import stateBuilder from "./state-builder.js";
import getFn from "./fn-builder.js";

const valueDefs = [
   { key: "a", value: "1 == 2" },
   { key: "b", value: "1 != 2" },
   { key: "c", value: "1 <= 2" },
   { key: "d", value: "1 >= 2" },
   { key: "e", value: "1 < 2" },
   { key: "f", value: "1 > 2" },
   { key: "g", value: "!f" },
];

const scanner = { scan: getScanner(regexPatterns, ["whitespace"]) };
const parser = new Parser();
const fnBuilder = { getFn };

const env = new Environment(scanner, parser, stateBuilder, fnBuilder);

for (const def of valueDefs) {
   env.defineValue(def.key, def.value);
}

