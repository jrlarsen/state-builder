export default class Environment {
   scanner = null;
   parser = null;
   fnBuilder = null;
   stateBuilder = null;
   state = {};
   fns = [];
   updateState = null;
   commands = {};

   constructor(scanner, parser, stateBuilder, fnBuilder) {
      this.scanner = scanner;
      this.parser = parser;
      this.stateBuilder = stateBuilder;
      this.fnBuilder = fnBuilder;
   }


   evaluate(patch = {}) {
      this.state = this.updateState(patch).newValues;
      console.log(this.state);
   }

   defineValue(key, expr) {
      const tokens = this.scanner.scan(expr);
      const exprTree = this.parser.parse(tokens);
      const deps = tokens.filter(t => t.type === "identifier").map(t => t.text);
      const fn = this.fnBuilder.getFn(exprTree);

      this.fns.push({
         key,
         deps,
         fn,
      });

      this.updateState = this.stateBuilder(this.fns, this.state);
      this.evaluate();
   }

   defineCommand(command, key, expr) {
      const tokens = this.scanner.scan(expr);
      const exprTree = this.parser.parse(tokens);
      this.commands[command] = {
         key,
         fn: this.fnBuilder.getFn(exprTree),
      };
   }

   doCommand(command) {
      const cmd = this.commands[command];
      if (cmd) {
         console.log(`Command: ${command}`);
         const value = cmd.fn(this.state);
         this.evaluate({ [cmd.key]: value });
      }
   }

   update(key, expr) {
      let patch = {};
      if (key && expr) {
         const tokens = this.scanner.scan(expr);
         const exprTree = this.parser.parse(tokens);
         const fn = this.fnBuilder.getFn(exprTree);
         const value = fn(this.state);
         patch = { [key]: value };
         console.log(`${key} set to ${value}`);
      }
      this.evaluate(patch);
   }

   reset() {
      this.updateState = this.stateBuilder(this.fns, {});
      this.evaluate();
   }
}
