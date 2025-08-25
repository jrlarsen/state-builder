import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import getScanner from "./scanner.js";
import regexPatterns from "./regex-patterns.js";
import Parser from "./parser.js";
import getFn from "./fn-builder.js";
import Environment from "./environment.js";
import stateBuilder from "./state-builder.js";

const commands = {
   "show": () => console.table(env.getState()),
   "reset": () => {
      env.reset();
      console.table(env.getState());
   },
};

function doCommand(command, argText) {
   commands[command](argText);
}

const scanner = { scan: getScanner(regexPatterns, ["whitespace"]) };
const parser = new Parser();
const fnBuilder = { getFn };

const env = new Environment(scanner, parser, stateBuilder, fnBuilder);


const rl = readline.createInterface({ input, output });

while (true) {
   const command = await rl.question('> ');
   if (["q", "exit", "end"].includes(command.toLowerCase())) break;

   if (/^[a-zA-Z]+:/.test(command)) {
      const cmdBits = command.split(':').map(i => i.trim());
      if (cmdBits.length < 3) {
         const cmd = cmdBits.shift();
         doCommand(cmd, cmdBits.join(":"));
      }
   } else {
      const bits = command.split('=').map(i => i.trim());
      if (bits.length === 2) {
         env.defineValue(bits[0], bits[1]);
      } else if (bits.length === 1) {
         console.log(env.getExpressionValue(bits[0]));
      } else {
         console.log(`
! Enter an assignment: "a = 5"
! or an expression: "a + 5"
      `);
      }
   }
}

rl.close();
