function getValue(key, status, value) {
   return { key, status, value };
}

export function makeValue(key, value) {
   return getValue(key, "ok", value);
}

export function makeError(key, value) {
   return getValue(key, "error", value);
}

function s(count) {
   return count === 1 ? "" : "s";
}

export function dependenciesError(key, errorDeps, missingDeps) {
   const errorText = [];
   if (missingDeps.length) {
      errorText.push(`${missingDeps.length} missing value${s(missingDeps.length)}: (${missingDeps.join(", ")})`);
   }
   if (errorDeps.length) {
      errorText.push(`${errorDeps.length} value${s(errorDeps.length)} with errors: (${errorDeps.join(", ")})`);
   }

   return makeError(key, `This value, ${key}, depends on ${errorText.join(' and ')}.`);
}

export function caughtError(key, message) {
   return makeError(key, `There was a problem calculating this value, ${key}: ${message}`);
}
