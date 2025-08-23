export default class Environment {
   scanner = null;
   parser = null;
   fnBuilder = null;
   stateBuilder = null;
   state = {};
   fns = [];
   updateState = null;

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

   define(key, expr) {
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
}
