import {getObjectValue, setObjectValue} from "../utils/objects/paths.js";
import areDeepEqual from "../utils/objects/deep-equal.js";

function getPropFromState(path, state) {
   const keys = path.split('.');
   const key = keys.shift();
   const value = state[key];
   if (keys.length === 0) return value;
   return getObjectValue(value, keys.join('.'));
}

function getPropsFromState(keys, state) {
   return keys.reduce((soFar, key) => {
      const value = getPropFromState(key, state).value;
      return setObjectValue(soFar, key, value);
   }, {});
}

const MAX_ATTEMPTS = 100;

export default function valueFunction(key, deps, fn, exclusions = [], list = {}) {
   function run(state) {
      const props = getPropsFromState(deps, state);
      let count = 0;
      let result;

      do {
         result = fn(props);
         count++;
      } while (count < MAX_ATTEMPTS && exclusions.some((exclusion) => areDeepEqual(exclusion, result)))

      if (count === MAX_ATTEMPTS) throw new Error("The value was too hard to generate");
      return result;
   }

   return { key, deps, run };
}
