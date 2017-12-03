function currentTile(x, y) {
    return {x: floor(x / tileWidth), y: floor(y / tileHeight)};
}

// If attr is undefined, return default value, otherwise return attr
function getDefault(attr, value) {
    return typeof attr === 'undefined' ? value : attr;
}

// Find dimensions of a rectangular nested array
function getDimensions(arr) {
    return {cols: arr[0].length, rows: arr.length};
}
