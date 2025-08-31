import {getObjectValue} from "../utils/objects/paths.js";
import {caughtError, dependenciesError, makeValue} from "./value.js";
import areDeepEqual from "../utils/objects/deep-equal.js";

function checkDeps(deps, state, oldState) {
   return deps.reduce((result, dep) => {
      const value = getObjectValue(state, dep);
      const oldValue = getObjectValue(oldState, dep);

      if (value === undefined) {
         result.missingDeps.push(dep);
         result.hasErrors = true;
      } else if (value.status === "error") {
         result.errorDeps.push(dep);
         result.hasErrors = true;
      } else {
         result.shouldUpdate ||= !areDeepEqual(value.value, oldValue?.value);
      }
      return result;
   }, { missingDeps: [], errorDeps: [], shouldUpdate: false, hasErrors: false });
}

function getValues(getters, initialState = {}, oldState = {}) {
   let state = initialState;
   const deferred = [];

   for (const valueGetter of getters) {
      const { key, deps, get } = valueGetter;
      const { missingDeps, errorDeps, shouldUpdate, hasErrors } = checkDeps(deps, state, oldState);

      if (hasErrors) {
         state[key] = dependenciesError(key, errorDeps, missingDeps);
         if (missingDeps.length) deferred.push(valueGetter);
      } else {
         try {
            state[key] = (shouldUpdate || oldState[key] === undefined)
               ? makeValue(key, get(state), true)
               : makeValue(key, state[key].value, !areDeepEqual(oldState[key].value, state[key].value));
         } catch (error) {
            state[key] = caughtError(key, error.message);
         }
      }
   }

   return { state, getters: deferred };
}

export default function stateBuilder() {
   let valueGetters = [];
   let savedState = {};

   function add(valueGetter, index) {
      valueGetters= valueGetters.toSpliced(index ?? valueGetters.length, 0, valueGetter);
   }

   function build(initialState = {}) {
      let result = { state: { ...initialState }, getters: valueGetters };
      let oldResult;

      do {
         oldResult = result;
         result = getValues(result.getters, result.state, savedState);
      } while (result.getters.length !== oldResult.getters.length);

      savedState = result.state;
      return result.state;
   }

   function patch(patch = {}) {
      const updates = Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, {value}]));
      return build({ ...savedState, ...updates });
   }

   return { add, build, patch };
}
