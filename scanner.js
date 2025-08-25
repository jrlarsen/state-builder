const getToken = (text, matchers) => {
   const patterns = Object.entries(matchers);

   while (patterns.length > 0) {
      const [type, pattern] = patterns.shift();
      const match = text.match(pattern);
      if (match?.length) return { type, text: match[0] };
   }

   return { type: 'unknown', text };
};

const scan = (text = "", patterns = {}, ignoredTypes = []) => {
   const tokens = [];
   let currentText = text;

   while (currentText.length) {
      const token = getToken(currentText, patterns);
      if (!ignoredTypes.includes(token.type)) tokens.push(token);
      currentText = currentText.slice(token.text.length);
   }

   return tokens;
};

function getScanner(patterns = {}, ignoredTypes = []) {
   return (text) => scan(text, patterns, ignoredTypes);
}

export default getScanner;
