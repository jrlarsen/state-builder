import {getObjectValue} from "../utils/objects/paths.js";
import getValue from "./value.js";

function checkDeps(deps, state) {
   return deps.reduce((result, dep) => {
      const v = getObjectValue(state, dep);
      if (v === undefined) result.missing.push(dep);
      else if (v.status === "error") result.errors.push(dep);
      return result;
   }, { missing: [], errors: [] });
}

export default function functionRunner() {
   let fns = [];

   function add(valueFn, index) {
      fns = fns.toSpliced(index ?? fns.length, 0, valueFn);
   }

   function run(initialState = {}) {
      let initialResult = runFns(fns, { ...initialState });
      if (initialResult.deferredFns.length === 0) return initialResult.state;
      let oldResult = initialResult;
      let result = initialResult;

      do {
         oldResult = result;
         result = runFns(result.deferredFns, result.state);
      } while (result.deferredFns.length !== oldResult.deferredFns.length);

      return result.state;
   }

   function runFns(fns, initialState = {}) {
      let state = initialState;
      const deferredFns = [];

      for (const valueFn of fns) {
         const { key, deps, run } = valueFn;
         const { missing, errors } = checkDeps(deps, state);
         if (errors.length) {
            state[key] = getValue(key, "error", "This value depends on at least one value with errors.");
         } else if (missing.length) {
            state[key] = getValue(key, "error", "Missing dependency");
            deferredFns.push(valueFn);
         } else {
            try {
               state = { ...state, [key]: getValue(key, "ok", run(state)) };
            } catch (error) {
               state[key] = getValue(key, "error", "There was a problem calculating this value.");
            }
         }
      }

      return { state, deferredFns };
   }

   return { add, run };
}
