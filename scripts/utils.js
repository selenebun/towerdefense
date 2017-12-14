new p5();   // p5.js global mode


// Check if approximately at tile center
function atTileCenter(x, y, col, row) {
    var c = center(col, row);
    return between(x, c.x - 1, c.x + 1) && between(y, c.y - 1, c.y + 1);
}

// Check if number falls within range
function between(num, min, max) {
    return num > Math.min(min, max) && num < Math.max(min, max);
}

// Build 2d array of value
function buildArray(cols, rows, val) {
    var arr = [];
    for (var x = 0; x < cols; x++) {
        arr[x] = [];
        for (var y = 0; y < rows; y++) {
            arr[x][y] = val;
        }
    }
    return arr;
}

// Return position at center of tile
function center(col, row) {
    return createVector(col*ts + ts/2, row*ts + ts/2);
}

// Copy 2d array
function copyArray(arr) {
    var newArr = [];
    for (var x = 0; x < arr.length; x++) {
        newArr[x] = [];
        for (var y = 0; y < arr[x].length; y++) {
            newArr[x][y] = arr[x][y];
        }
    }
}

// Convert grid coordinates to string
function cts(col, row) {
    return col + ',' + row;
}

// Returns an array of entities with a certain name
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

// Get entities within a range (radius in tiles)
// TODO have minimum and maximum range
function getInRange(cx, cy, radius, entities) {
    var results = [];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (insideCircle(e.pos.x, e.pos.y, cx, cy, radius * ts)) {
            results.push(e);
        }
    }
    return results;
}

// Get all taunting enemies
function getTaunting(entities) {
    var results = [];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (e.taunt) results.push(e);
    }
    return results;
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

// Return orthogonal neighbors of a certain value
function neighbors(grid, col, row, val) {
    var neighbors = [];
    if (col !== 0 && grid[col - 1][row] === val) {
        neighbors.push(cts(col - 1, row));
    }
    if (row !== 0 && grid[col][row - 1] === val) {
        neighbors.push(cts(col, row - 1));
    }
    if (col !== grid.length - 1 && grid[col + 1][row] === val) {
        neighbors.push(cts(col + 1, row));
    }
    if (row !== grid[col].length - 1 && grid[col][row + 1] === val) {
        neighbors.push(cts(col, row + 1));
    }
    return neighbors;
}

function outsideRect(x, y, cx, cy, w, h) {
    return x < cx || y < cy || x > cx + w || y > cy + h;
}

// Returns a random integer, using the same arguments as p5js random()
function randint() {
    return floor(random(...arguments));
}

// Displays a range of numbers
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

// Creates a string representing a range of numbers
function textRange(min, max) {
    if (min === max) {
        return String(min);
    } else {
        return String(min) + '-' + String(max);
    }
}

// Convert vector to string
function vts(v) {
    return v.x + ',' + v.y;
}
