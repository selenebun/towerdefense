function createTower(x, y, template) {
    var t = new Tower(x, y);
    t.upgrade(template);
    return t;
}


// Target selection

// Furthest through map (closest to exit)
function getFurthest(entities) {
    var lowestDist = 10000;
    var chosen = entities[0];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        var t = gridPos(e.pos.x, e.pos.y);
        var dist = distMap[t.x][t.y];
        if (dist < lowestDist) {
            lowestDist = dist;
            chosen = e;
        }
    }
    return chosen;
}

// Nearest to tower
function getNearest(entities) {
    var lowestDist = 10000;
    var chosen = entities[0];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        var dist = this.pos.dist(e.pos);
        if (dist < lowestDist) {
            lowestDist = dist;
            chosen = e;
        }
    }
    return chosen;
}

// Strongest enemy
function getStrongest(entities) {}


// Tower templates

var tower = {};

tower.laser = {
    // Display
    barrel: [103, 128, 159],
    color: [25, 181, 254],
    // Misc
    name: 'laser',
    // Stats
    cooldown: 0,
    // Methods
    onAim: function(e) {
        this.aim(e.pos.x, e.pos.y);
        stroke(this.color);
        line(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
    },
    target: getFurthest
};

tower.sniper = {
    // Display
    barrel: [207, 0, 15],
    color: [103, 128, 159],
    length: 0.5,
    radius: 0.6,
    width: 1.1,
    // Misc
    name: 'sniper',
    // Stats
    cooldown: 0,
    range: 15,
    // Methods
    draw() {
        // Draw turret base
        if (this.hasBase) this.drawBase();
        // Draw barrel
        if (this.hasBarrel) {
            push();
            translate(this.pos.x, this.pos.y);
            rotate(this.angle);
            this.drawBarrel();
            pop();
        }
    },
    drawBarrel: function() {
        stroke(this.border);
        fill(this.barrel);
        var back = -this.length * ts / 3;
        var front = back + this.length * ts;
        var side = this.width * ts / 2;
        triangle(back, -side, back, side, front, 0);
    },
    onAim: function(e) {
        this.aim(e.pos.x, e.pos.y);
        stroke(this.barrel);
        line(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
    },
    target: getFurthest
};

/*
var tower = {};


tower.laser = {
    toAffect: ['basic'],
    toTarget: ['basic'],
    name: 'laser',
    color: [25, 181, 254],
    barrel: [103, 128, 159],
    showBarrel: true,
    onTarget: function(e) {
        this.aim(e.pos.x, e.pos.y);
        stroke(this.color);
        var t = getCenter(this.pos.x, this.pos.y);
        line(t.x, t.y, e.pos.x, e.pos.y);
    }
};
*/
