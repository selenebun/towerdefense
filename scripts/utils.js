String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


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

// Return non-diagonal neighbors with a certain value
function getNeighbors(walkMap, col, row, value) {
    var neighbors = [];
    if (col !== 0 && walkMap[col - 1][row] === value) {
        neighbors.push(cts(col - 1, row));
    }
    if (row !== 0 && walkMap[col][row - 1] === value) {
        neighbors.push(cts(col, row - 1));
    }
    if (col !== cols - 1 && walkMap[col + 1][row] === value) {
        neighbors.push(cts(col + 1, row));
    }
    if (row !== rows - 1 && walkMap[col][row + 1] === value) {
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

function mouseInMap() {
    return between(mouseX, 0, width) && between(mouseY, 0, height);
}

function outsideRect(x, y, cx, cy, w, h) {
    return x < cx || y < cy || x > cx + w || y > cy + h;
}

function rangeText(min, max) {
    if (min === max) {
        return String(min);
    } else {
        return String(min) + '-' + String(max);
    }
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
