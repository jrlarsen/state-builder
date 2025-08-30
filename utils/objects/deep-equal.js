function areEqualValues(a, b) {
   return a === b;
}

function areEqualArrays(a, b) {
   return Array.isArray(a) &&
          Array.isArray(b) &&
          a.length === b.length &&
          a.every((val, index) => areDeepEqual(val, b[index]));
}

function isObject(a) {
   return typeof a === 'object' && a !== null && !Array.isArray(a);
}

function areEqualObjects(a, b) {
   if (!isObject(a) || !isObject(b)) return false;
   const aKeys = Object.keys(a);
   const bKeys = Object.keys(b);
   return aKeys.length === bKeys.length && aKeys.every((key) => areDeepEqual(a[key], b[key]));
}

export default function areDeepEqual(a, b) {
   return areEqualValues(a, b) || areEqualArrays(a, b) || areEqualObjects(a, b);
}
