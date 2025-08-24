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

export default function getFn(expr) {
   switch (expr.type) {
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
