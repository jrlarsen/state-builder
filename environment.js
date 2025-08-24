export default class Environment {
   #scanner = null;
   #parser = null;
   #fnBuilder = null;
   #stateBuilder = null;
   #state = {};
   #fns = [];
   #updateState = null;
   #commands = {};

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
      return { deps, fn: this.#fnBuilder.getFn(exprTree) };
   }

   #updateBuilder() {
      this.#updateState = this.#stateBuilder(this.#fns);
   }

   evaluate(patch = {}) {
      this.#state = this.#updateState(patch, this.#state).newValues;
      console.log(this.#state);
   }

   defineValue(key, expr) {
      const { deps, fn } = this.#getFunction(expr);
      this.#fns.push({ key, deps, fn });
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

   update(key, expr) {
      this.evaluate({ [key]: this.#getFunction(expr).fn(this.#state) });
   }

   reset() {
      this.#updateBuilder(true);
      this.evaluate();
   }
}
