new p5();   // p5.js global mode


// Check if approximately at tile center
function atTileCenter(x, y, col, row) {
    var c = center(col, row);
    var t = ts / 24;
    return between(x, c.x - t, c.x + t) && between(y, c.y - t, c.y + t);
}

// Check if number falls within range (exclusive)
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
    return newArr;
}

// Copy text to clipboard
function copyToClipboard(str) {
    var textArea = document.createElement('textarea');

    // Ensure element is as invisible as possible
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    textArea.value = str;
    document.body.appendChild(textArea);
    textArea.select();

    // Copy text
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text was ' + msg);
    } catch (err) {
        console.log('Unable to copy to clipboard');
        prompt('Map string:', str);
    }

    document.body.removeChild(textArea);
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

// Get first enemy (i.e. closest to exit)
// TODO determine more accurate selection system that is not fooled by loops
function getFirst(entities) {
    var leastDist = 10000;
    var chosen = entities[0];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        var t = gridPos(e.pos.x, e.pos.y);
        var dist = dists[t.x][t.y];
        if (dist < leastDist) {
            leastDist = dist;
            chosen = e;
        }
    }
    return chosen;
}

// Get entities within a range (radius in tiles)
// TODO have minimum and maximum range
function getInRange(cx, cy, radius, entities) {
    var results = [];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (insideCircle(e.pos.x, e.pos.y, cx, cy, (radius + 1) * ts)) {
            results.push(e);
        }
    }
    return results;
}

// Nearest to entity
function getNearest(entities, pos, ignore) {
    var lowestDist = 10000;
    var chosen = entities[0];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (typeof ignore !== 'undefined' && ignore.includes(e)) continue;
        var dist = pos.dist(e.pos);
        if (dist < lowestDist) {
            lowestDist = dist;
            chosen = e;
        }
    }
    return chosen;
}

// Get entities without a certain status effect
function getNoEffect(entities, effect) {
    var results = [];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (getByName(e.effects, effect).length === 0) results.push(e);
    }
    return results;
}

// Get enemy with the most health
function getStrongest(entities) {
    var mostHealth = 0;
    var chosen = entities[0];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (e.health > mostHealth) {
            mostHealth = e.health;
            chosen = e;
        }
    }
    return chosen;
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

function polygon(x, y, radius, npoints) {
    var angle = TWO_PI / npoints;
    beginShape();
    for (var a = 0; a < TWO_PI; a += angle) {
        var sx = x + cos(a) * radius;
        var sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
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

// Remove empty temporary spawnpoints
function removeTempSpawns() {
    for (var i = tempSpawns.length - 1; i >= 0; i--) {
        if (tempSpawns[i][1] === 0) tempSpawns.splice(i, 1);
    }
}

// Replace values in copy of 2d array
function replaceArray(arr, vals, subs) {
    var newArr = [];
    for (var x = 0; x < arr.length; x++) {
        newArr[x] = [];
        for (var y = 0; y < arr[x].length; y++) {
            var curVal = arr[x][y];
            var i = vals.indexOf(curVal);
            if (i === -1) {
                newArr[x][y] = curVal;
            } else {
                newArr[x][y] = vals.length === subs.length ? subs[i] : subs[0];
            }
        }
    }
    return newArr;
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
