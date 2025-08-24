const ops = {
   "binary": {
      "+": (a, b) => a + b,
      "-": (a, b) => a - b,
      "*": (a, b) => a * b,
      "/": (a, b) => a / b,
   },
   "literal": (a) => a.value,
   "variable": (a) => a.value,
};

const fns = {
   int: (a, b) => {
      const range = b - a + 1;
      return Math.floor(Math.random() * range) + a;
   },
};

export default function getFn(expr) {
   switch (expr.type) {
      case "fnCall":
         const fnName = expr.fn;
         const fn = Math[fnName] ?? fns[fnName];
         if (!fn) return () => null;
         const argFns = expr.args.map((arg) => getFn(arg));
         return (state) => {
            const argVals = argFns.map((argFn) => argFn(state));
            return fn(...argVals);
         }
      case "expression":
         return getFn(expr.expr);
      case "binary":
         const left = getFn(expr.left);
         const right = getFn(expr.right);
         const op = ops.binary[expr.operator.text];
         return (state) => op(left(state), right(state));
      case "variable":
         return (state) => state[expr.key];
      default:
         return () => parseFloat(expr.value);
   }
}
