import {getObjectValue, setObjectValue} from "../utils/objects/paths.js";
import areDeepEqual from "../utils/objects/deep-equal.js";

function getPropFromState(path, state) {
   const [key, ...keys] = path.split('.');
   return keys.length ? getObjectValue(state[key], keys.join('.')) : state[key];
}

function getPropsFromState(keys, state) {
   return keys.reduce((soFar, key) => setObjectValue(soFar, key, getPropFromState(key, state).value), {});
}

const MAX_ATTEMPTS = 100;

export default function valueGetter(key, deps, fn, exclusions = [], list = {}) {
   function get(state) {
      const props = getPropsFromState(deps, state);
      let count = 0;
      let result;

      do {
         result = fn(props);
         count++;
      } while (count < MAX_ATTEMPTS && exclusions.some((exclusion) => areDeepEqual(exclusion, result)))

      if (count === MAX_ATTEMPTS) throw new Error("The value was too hard to generate.");
      return result;
   }

   return { key, deps, get };
}
