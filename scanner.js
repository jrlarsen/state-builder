const getToken = (text, matchers) => {
   const patterns = Object.entries(matchers);
   let token = { type: "unknown", text };

   patterns.forEach(([type, pattern]) => {
      if (token.type !== "unknown") return;
      const match = text.match(pattern);
      if (match?.length) {
         token = { type, text: match[0] };
      }
   });

   return token;
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
