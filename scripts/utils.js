function currentTile(x, y) {
    return {x: floor(x / tileWidth), y: floor(y / tileHeight)};
}

// Find dimensions of a map
function getDimensions(map) {
    return {cols: map.length, rows: map[0].length};
}
