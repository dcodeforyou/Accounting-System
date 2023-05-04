function exists(locationMap, location) {
    for(let key of locationMap.keys()) {
        if(JSON.stringify(key) == JSON.stringify(location))
            return true;
    }
    return false;
}

function getLocationId(locationMap, location) {
    for(let [key, value] of locationMap.entries()) {
        if(JSON.stringify(key) == JSON.stringify(location)) {
            return value;
        }
    }
}

module.exports = { exists, getLocationId };