import {getObjectValue, setObjectValue} from "../utils/objects/paths.js";

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

export default function valueFunction(key, deps, fn) {
   function run(state) {
      const props = getPropsFromState(deps, state);
      return fn(props);
   }

   return { key, deps, run };
}
