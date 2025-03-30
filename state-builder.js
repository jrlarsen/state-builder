function stateBuilder(fnList) {
    return function(updates) {
        return fnList.reduce((soFar, fn) => fn(soFar), { ...updates });
    }
}