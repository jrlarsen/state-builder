export default class Parser {
   tokens = [];
   current = 0;

   parse(tokens) {
      this.current = 0;
      this.tokens = tokens;
      return this.expression();
   }

   expression() {
      return this.list();
   }

   list() {
      if (this.match(["left-bracket"])) {
         const terms = [];
         if (!this.check("right-bracket")) {
            do {
               terms.push(this.expression());
            } while (this.match(["comma"]));
         }

         const paren = this.consume("right-bracket", "Expect ']' after terms.");

         return {
            type: "list",
            terms,
            paren,
         };
      }
      return this.or();
   }

   or() {
      let expr = this.and();

      while (this.match(["pipe-pipe"])) {
         expr = {
            type: "binary",
            left: expr,
            operator: this.previous(),
            right: this.and(),
         }
      }

      return expr;
   }

   and() {
      let expr = this.equality();

      while (this.match(["amp-amp"])) {
         expr = {
            type: "binary",
            left: expr,
            operator: this.previous(),
            right: this.equality(),
         }
      }

      return expr;

   }

   equality() {
      let expr = this.comparison();

      while (this.match(["bang-equal", "equal-equal"])) {
         expr = {
            type: "binary",
            left: expr,
            operator: this.previous(),
            right: this.comparison(),
         }
      }

      return expr;
   }

   comparison() {
      let expr = this.term();

      while (this.match(["greater", "greater-equal", "less", "less-equal"])) {
         expr = {
            type: "binary",
            left: expr,
            operator: this.previous(),
            right: this.term(),
         }
      }

      return expr;
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
      if (this.match(["minus", "bang"])) {
         return {
            type: "unary",
            operator: this.previous(),
            right: this.unary(),
         };
      }

      return this.exponential();
   }

   exponential() {
      let expr = this.fnCall();

      while (this.match(["star-star", "caret"])) {
         expr = {
            type: "binary",
            left: expr,
            operator: this.previous(),
            right: this.exponential(),
         };
      }

      return expr;
   }

   fnCall() {
      let expr = this.primary();

      if (this.match(["left-parens"])) {
         const args = [];

         if (!this.check("right-parens")) {
            do {
               args.push(this.expression());
            } while (this.match(["comma"]));
         }

         const paren = this.consume("right-parens", "Expect ')' after arguments.");

         expr = {
            type: "fnCall",
            args,
            fn: expr.key,
            paren,
         };
      }
      return expr;
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
