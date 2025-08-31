import {getObjectValue} from "../utils/objects/paths.js";
import {caughtError, dependenciesError, makeValue} from "./value.js";

function checkDeps(deps, state) {
   const depErrors = deps.reduce((result, dep) => {
      const v = getObjectValue(state, dep);
      if (v === undefined) result.missing.push(dep);
      else if (v.status === "error") result.errors.push(dep);
      return result;
   }, { missing: [], errors: [] });

   depErrors.hasErrors = depErrors.missing.length > 0 || depErrors.errors.length > 0;
   return depErrors;
}

export default function stateBuilder() {
   let valueGetters = [];

   function add(valueGetter, index) {
      valueGetters= valueGetters.toSpliced(index ?? valueGetters.length, 0, valueGetter);
   }

   function build(initialState = {}) {
      let result = { state: { ...initialState }, getters: valueGetters };
      let oldResult;

      do {
         oldResult = result;
         result = getValues(result.getters, result.state);
      } while (result.getters.length !== oldResult.getters.length);

      return result.state;
   }

   function getValues(getters, initialState = {}) {
      let state = initialState;
      const deferred = [];

      for (const valueGetter of getters) {
         const { key, deps, get } = valueGetter;
         const { missing, errors, hasErrors } = checkDeps(deps, state);

         if (hasErrors) {
            state[key] = dependenciesError(key, errors, missing);
            if (missing.length) deferred.push(valueGetter);
         } else {
            try {
               state[key] = makeValue(key, get(state));
            } catch (error) {
               state[key] = caughtError(key, error.message);
            }
         }
      }

      return { state, getters: deferred };
   }

   return { add, build };
}
