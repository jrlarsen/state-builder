import {getObjectValue, setObjectValue} from "../utils/objects/paths.js";
import areDeepEqual from "../utils/objects/deep-equal.js";

function getPropFromState(path, state) {
   const [key, ...keys] = path.split('.');
   return keys.length ? getObjectValue(state[key], keys.join('.')) : state[key];
}

export function getPropsFromState(keys, state) {
   return keys.reduce((soFar, key) => setObjectValue(soFar, key, getPropFromState(key, state)?.value), {});
}

const MAX_ATTEMPTS = 100;

export default function valueGetter(key, deps = [], fn, exclusions = [], list = {}) {
   let localExclusions = [ ...exclusions ];
   const publicDeps = deps.filter(dep => !dep.startsWith('_'));
   const { length, unique = false } = list;

   function getValue(state) {
      const props = getPropsFromState(deps, state);
      let count = 0;
      let result;
      let isExcluded = false;

      do {
         count++;
         result = fn(props);
         isExcluded = localExclusions.some((exclusion) => areDeepEqual(exclusion, result));
         if (unique && !isExcluded) localExclusions.push(result);
      } while (count < MAX_ATTEMPTS && isExcluded)

      if (count === MAX_ATTEMPTS) throw new Error("The value was too hard to generate.");
      return result;
   }

   function getList(state) {
      const result = Array(length).fill().map((_, i) => {
         return getValue({ ...state, _i: { value: i } });
      });
      localExclusions = [ ...exclusions ];
      return result;
   }

   return { key, deps: publicDeps, get: length === undefined ? getValue : getList };
}
