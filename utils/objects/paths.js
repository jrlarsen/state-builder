export function setObjectValue(obj, path, value) {
   const result = { ...obj };
   const keys = path.split('.');
   let ref = result;

   while (keys.length) {
      let key = keys.shift();
      ref[key] ??= {};
      if (!keys.length) ref[key] = value;
      ref = ref[key];
   }

   return result;
}

export function getObjectValue(obj, path) {
   return path.split('.').reduce((value, key) => value?.[key], { ...obj });
}

export function hasChangedProperty(obj, path, value) {
   return getObjectValue(obj, path) !== value;
}

export function hasChangedProperties(oldObj, paths, newObj) {
   return paths.some((path) => hasChangedProperty(oldObj, path, newObj[path]));
}
