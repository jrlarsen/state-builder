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
                const depsSet = new Set(deps);
                if (depsSet.intersection(updatedKeys).size > 0 || newValues[name] === undefined) {
                    const value = fn(newValues);
                    if (value !== newValues[name]) {
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
