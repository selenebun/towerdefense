function createTower(x, y, template) {
    var t = new Tower(x, y);
    t.upgrade(template);
    return t;
}


// Targeting systems
var target = {};

// Furthest through map (closest to exit)
target.furthest = function(entities) {
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
};

// Nearest to tower
target.nearest = function(entities) {
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
};

// Most health + armor
target.strongest = function(entities) {};


// Tower templates
var tower = {};

tower.laser = {
    // Display
    color: [25, 181, 254],
    secondary: [103, 128, 159],
    // Misc
    name: 'laser',
    // Stats
    cooldown: 0,
    cost: 75,
    damage: 0.02
};

tower.sniper = {
    // Display
    color: [207, 0, 15],
    length: 0.5,
    radius: 0.6,
    secondary: [103, 128, 159],
    width: 1.1,
    // Misc
    name: 'sniper',
    // Stats
    cooldown: 120,
    cost: 400,
    damage: 100,
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
        fill(this.color);
        var back = -this.length * ts / 3;
        var front = back + this.length * ts;
        var side = this.width * ts / 2;
        triangle(back, -side, back, side, front, 0);
    },
    drawBase: function() {
        stroke(this.border);
        fill(this.secondary);
        ellipse(this.pos.x, this.pos.y, this.radius * ts, this.radius * ts);
    }
};
