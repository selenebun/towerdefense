// Return column and row
function getCoords(x, y) {
    return {col: floor(x / tWidth), row: floor(y / tHeight)};
}

/*
function getCenter(col, row) {
    return {
        x: col * tileWidth + tileWidth / 2,
        y: row * tileHeight + tileHeight / 2
    };
}

// If attr is undefined, return default value, otherwise return attr
function getDefault(attr, value) {
    return typeof attr === 'undefined' ? value : attr;
}

// Find dimensions of a rectangular nested array
function getDimensions(arr) {
    return {cols: arr[0].length, rows: arr.length};
}

function getTile(x, y) {
    var p = getGridCoords(x, y);
    return palette[grid[p.row][p.col]];
}
*/
