function atTileCenter(x, y, cx, cy) {
    return between(x, cx - 1, cx + 1) && between(y, cy - 1, cy + 1);
}

function between(num, min, max) {
    return num > Math.min(min, max) && num < Math.max(min, max);
}

// Build 2d array of value
function buildMap(cols, rows, value) {
    var arr = [];
    for (var col = 0; col < cols; col++) {
        arr[col] = [];
        for (var row = 0; row < rows; row++) {
            arr[col][row] = value;
        }
    }
    return arr;
}

// Return position at center of tile
function center(col, row) {
    return createVector(col*ts + ts/2, row*ts + ts/2);
}

// Convert grid coordinate to string
function cts(col, row) {
    return col + ',' + row;
}

function getByName(entities, names) {
    var results = [];
    if (typeof names === 'string') names = [names];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        for (var j = 0; j < names.length; j++) {
            if (e.name === names[j]) results.push(e);
        }
    }
    return results;
}

function getByType(entities, type) {
    var results = [];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (e.type === type) results.push(e);
    }
    return results;
}

// Return non-diagonal walkable neighbors
function getNeighbors(col, row) {
    var neighbors = [];
    if (col !== 0 && walkMap[col - 1][row] === 0) {
        neighbors.push(cts(col - 1, row));
    }
    if (row !== 0 && walkMap[col][row - 1] === 0) {
        neighbors.push(cts(col, row - 1));
    }
    if (col !== cols - 1 && walkMap[col + 1][row] === 0) {
        neighbors.push(cts(col + 1, row));
    }
    if (row !== rows - 1 && walkMap[col][row + 1] === 0) {
        neighbors.push(cts(col, row + 1));
    }
    return neighbors;
}

// Return grid coordinate
function gridPos(x, y) {
    return createVector(floor(x / ts), floor(y / ts));
}

function insideCircle(x, y, cx, cy, r) {
    return sq(x - cx) + sq(y - cy) < sq(r);
}

function outsideRect(x, y, cx, cy, w, h) {
    return x < cx || y < cy || x > cx + w || y > cy + h;
}

// Convert string to vector
function stv(str) {
    var arr = str.split(',');
    return createVector(parseInt(arr[0]), parseInt(arr[1]));
}

// Convert vector to string
function vts(v) {
    return v.x + ',' + v.y;
}

/*
// Get array of entities that have a name in the array of names
function getByName(entities, names) {
    var results = [];
    if (typeof names === 'string') names = [names];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        for (var j = 0; j < names.length; j++) {
            if (e.name === names[j]) results.push(e);
        }
    }
    return results;
}

// Copy 2d array
function copyMap(myMap) {
    var copy = [];
    for (var col = 0; col < myMap.length; col++) {
        copy[col] = [];
        for (var row = 0; row < myMap[0].length; row++) {
            copy[col][row] = myMap[col][row];
        }
    }
    return copy;
}

// Return center of current tile (combination of getTile() and getCenter())
function getTileCenter(x, y) {
    var c = getTile(x, y);
    return getCenter(c.x, c.y);
}
*/
