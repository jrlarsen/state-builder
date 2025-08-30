import {getObjectValue} from "../utils/objects/paths.js";
import getValue from "./value.js";

function checkDeps(valueFn, state) {
   return valueFn.deps.reduce((result, dep) => {
      const v = getObjectValue(state, dep.key);
      if (v === undefined) result.missing.push(dep.key);
      else if (v.type === "error") result.errors.push(dep.key);
      return result;
   }, { missing: [], errors: [] });
}

export default function functionRunner() {
   let fns = [];

   function add(valueFn, index) {
      fns = fns.toSpliced(index ?? fns.length, 0, valueFn);
   }

   function run(initialState = {}) {
      let initialResult = runFns({ ...initialState });
      if (initialResult.deferredFns.length === 0) return initialResult.state;
      let oldResult = initialResult;
      let result = initialResult;

      do {
         oldResult = result;
         result = runDeferredFns(result.deferredFns, result.state);
      } while (result.deferredFns.length !== oldResult.deferredFns.length);

      return result.state;
   }

   function runFns(initialState = {}) {
      let state = initialState;
      const deferredFns = [];

      for (const valueFn of fns) {
         const { missing, errors } = checkDeps(valueFn, state);
         if (errors.length) {
            state[valueFn.key] = getValue(valueFn.key, "error", "This value depends on at least one value with errors.");
         } else if (missing.length) {
            deferredFns.push(valueFn);
         } else {
            try {
               state = { ...state, [valueFn.key]: getValue(valueFn.key, "ok", valueFn.run(state)) };
            } catch (error) {
               state[valueFn.key] = getValue(valueFn.key, "error", "The was a problem calculating this value.");
            }
         }
      }

      return { state, deferredFns };
   }

   function runDeferredFns(dFns, initialState = {}) {
      let state = initialState;
      const deferredFns = [];

      for (const valueFn of dFns) {
         const { missing, errors } = checkDeps(valueFn, state);
         if (errors.length) {
            state[valueFn.key] = getValue(valueFn.key, "error", "This value depends on at least one value with errors.");
         } else if (missing.length) {
            state[valueFn.key] = getValue(valueFn.key, "error", "Missing dependency");
            deferredFns.push(valueFn);
         } else {
            try {
               state = { ...state, [valueFn.key]: getValue(valueFn.key, "ok", valueFn.run(state)) };
            } catch (error) {
               state[valueFn.key] = getValue(valueFn.key, "error", "The was a problem calculating this value.");
            }
         }
      }

      return { state, deferredFns };
   }

   return { add, run };
}
