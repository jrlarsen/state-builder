const patterns = {
   "minus": /^[-]/,
   "plus": /^[+]/,
   "slash": /^[/]/,
   "star": /^[*]/,
   "identifier": /^[a-zA-Z]+/,
   "whitespace": /^\s+/,
   "number": /^[1-9][0-9]*(.[0-9]+)?/,
   "left-parens": /^\(/,
   "right-parens": /^\)/,
   "comma": /^,/,
};

export default patterns;
