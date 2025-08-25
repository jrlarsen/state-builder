import {hasChangedProperties, hasChangedProperty} from "./utils/objects/paths.js";

export default function stateBuilder(fnList) {
   return function(updates = {}, oldValues = {}) {
        const changed = Object.fromEntries(
            Object.entries(updates)
               .filter(([key, value]) => value !== undefined && oldValues[key] !== value)
        );

        const updatedKeys = new Set(Object.keys(changed));
        const newValues = { ...oldValues, ...changed };

        fnList.forEach(({key: name, deps, fn}) => {
            if (!updatedKeys.has(name)) {
                if (hasChangedProperties(oldValues, deps, newValues) || newValues[name] === undefined) {
                    const value = fn(newValues);
                    if (hasChangedProperty(newValues, name, value)) {
                        newValues[name] = value;
                        updatedKeys.add(name);
                        console.log(`${name} -> ${value}`);
                    }
                }
            }
        });

        return { newValues, updatedKeys };
    }
}
