import Environment from "./environment.js";
import getScanner from "./scanner.js";
import regexPatterns from "./regex-patterns.js";
import Parser from "./parser.js";
import stateBuilder from "./state-builder.js";
import getFn from "./fn-builder.js";

const valueDefs = [
   {
      key: "a",
      value: "5",
   },
   {
      key: "b",
      value: "12",
   },
   {
      key: "c",
      value: "a + b",
   }
];

const scanner = { scan: getScanner(regexPatterns, ["whitespace"]) };
const parser = new Parser();
const fnBuilder = { getFn };

const env = new Environment(scanner, parser, stateBuilder, fnBuilder);

for (const def of valueDefs) {
   env.define(def.key, def.value);
}

env.evaluate({});

env.update("b", "b + 1");

env.update("a", "a * 2");
