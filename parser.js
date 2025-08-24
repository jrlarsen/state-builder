export default class Parser {
   tokens = [];
   current = 0;

   parse(tokens) {
      this.current = 0;
      this.tokens = tokens;
      return this.expression();
   }

   expression() {
      return this.term();
   }

   term() {
      let expr = this.factor();

      while (this.match(["minus", "plus"])) {
         expr = {
            type: "binary",
            left: expr,
            operator: this.previous(),
            right: this.factor(),
         };
      }

      return expr;
   }

   factor() {
      let expr = this.unary();

      while (this.match(["slash", "star"])) {
         expr = {
            type: "binary",
            left: expr,
            operator: this.previous(),
            right: this.unary(),
         };
      }

      return expr;
   }

   unary() {
      if (this.match(["minus"])) {
         return {
            type: "unary",
            operator: this.previous(),
            right: this.unary(),
         };
      }

      return this.primary();
   }

   primary() {
      if (this.match(["number"])) {
         return {
            type: "literal",
            value: this.previous().text,
         };
      }

      if (this.match(["identifier"])) {
         return {
            type: "variable",
            key: this.previous().text,
         };
      }

      if (this.match(["left-parens"])) {
         const expr = this.expression();
         this.consume("right-parens", "Expect ')' after expression.");
         return {
            type: 'expression',
            expr,
         }
      }
   }

   match(types) {
      let matched = false;

      for (const type of types) {
         if (this.check(type)) {
            this.advance();
            matched = true;
            break;
         }
      }

      return matched;
   }

   consume(type, message) {
      if (this.check(type)) return this.advance();
      throw new Error(message);
   }

   isAtEnd() {
      return this.current === this.tokens.length;
   }

   check(type) {
      if (this.isAtEnd()) return false;
      return this.peek().type === type;
   }

   advance() {
      if (!this.isAtEnd()) this.current++;
      return this.previous();
   }

   peek() {
      return this.tokens[this.current];
   }

   previous() {
      return this.tokens[this.current - 1];
   }
}
