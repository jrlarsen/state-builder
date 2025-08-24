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
      const exprTree = this.#parser.parse(tokens);
      const deps = tokens.filter(t => t.type === "identifier").map(t => t.text);
      const fn = this.#fnBuilder.getFn(exprTree);
      return { deps, fn: () => fn(this.#state) };
   }

   #updateBuilder(shouldReset) {
      this.#updateState = this.#stateBuilder(this.#fns, shouldReset ? {} : this.#state);
   }

   evaluate(patch = {}) {
      this.#state = this.#updateState(patch).newValues;
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
      if (cmd) this.evaluate({ [cmd.key]: cmd.fn() });
   }

   update(key, expr) {
      this.evaluate({ [key]: this.#getFunction(expr).fn() });
   }

   reset() {
      this.#updateBuilder(true);
      this.evaluate();
   }
}
