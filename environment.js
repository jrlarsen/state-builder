import {setObjectValue} from "./utils/objects/paths.js";

export default class Environment {
   #scanner = null;
   #parser = null;
   #fnBuilder = null;
   #stateBuilder = null;
   #state = {};
   #objectState = {};
   #fns = [];
   #updateState = null;
   #commands = {};
   #definedFunctions = {};

   constructor(scanner, parser, stateBuilder, fnBuilder) {
      this.#scanner = scanner;
      this.#parser = parser;
      this.#stateBuilder = stateBuilder;
      this.#fnBuilder = fnBuilder;
   }

   #getFunction(expr) {
      const tokens = this.#scanner.scan(expr);

      // console.log(tokens);

      const exprTree = this.#parser.parse(tokens);

      // console.log(exprTree);

      const deps = tokens.filter(t => t.type === "identifier").map(t => t.text);
      return { deps, fn: this.#fnBuilder.getFn(exprTree, this.#definedFunctions).fn };
   }

   #updateBuilder() {
      this.#updateState = this.#stateBuilder(this.#fns);
   }

   #buildObjects() {
      this.#objectState = Object.entries(this.#state)
         .reduce((state, [keyPath, value]) => setObjectValue(state, keyPath, value), {});
   }

   evaluate(patch = {}, reset) {
      this.#state = this.#updateState(patch, reset ? {} : this.#state).newValues;
      this.#buildObjects();
      // console.table(this.#objectState);
      // console.log(this.#objectState);
   }

   defineValue(key, expr) {
      const { deps, fn } = this.#getFunction(expr);
      this.#fns.push({ deps, fn, key });
      this.#updateBuilder();
      this.evaluate();
   }

   defineCommand(command, key, expr) {
      this.#commands[command] = { key, fn: this.#getFunction(expr).fn };
   }

   doCommand(command) {
      const cmd = this.#commands[command];
      if (cmd) this.evaluate({ [cmd.key]: cmd.fn(this.#state) });
   }

   defineFunction(key, params, exprList, returnValue, whileCondition) {
      const fns = exprList.map(expr => [ expr.key, this.#getFunction(expr.fn).fn ]);
      const condition = this.#getFunction(whileCondition).fn;
      const returnFn = this.#getFunction(returnValue).fn;

      this.#definedFunctions[key] = (...args) => {
         let state = Object.fromEntries(args.map((arg, i) => [params[i], arg]));
         while (condition(state)) {
            state = fns.reduce((newState, [stateKey, fn]) => ({ ...newState, [stateKey]: fn(newState)}), state);
         }
         return returnFn(state);
      }
   }

   update(key, expr) {
      this.evaluate({ [key]: this.getExpressionValue(expr) });
   }

   getExpressionValue(expr) {
      return this.#getFunction(expr).fn(this.#state);
   }

   getState() {
      return this.#objectState;
   }

   reset() {
      this.#updateBuilder(true);
      this.evaluate({}, true);
   }

   clear() {
      this.#state = {};
      this.#objectState = {};
      this.#fns = [];
      this.#updateState = null;
      this.#commands = {};
   }
}
