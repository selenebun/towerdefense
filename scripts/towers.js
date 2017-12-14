function createTower(x, y, template) {
    var t = new Tower(x, y);
    t.upgrade(template);
    t.onCreate();
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
        var dist = dists[t.x][t.y];
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

// Most effective health (including armor)
target.strongest = function(entities) {
    var mostStrength = 0;
    var chosen = entities[0];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        var strength = e.health / (1 - e.armor);
        if (strength > mostStrength) {
            mostStrength = strength;
            chosen = e;
        }
    }
    return chosen;
};


// Tower templates
var tower = {};

tower.gun = {
    // Display
    color: [248, 148, 6],
    secondary: [103, 128, 159],
    // Misc
    name: 'gun',
    title: 'Gun Tower',
    // Stats
    cooldownMax: 18,
    cooldownMin: 8,
    cost: 25,
    range: 3
};

tower.laser = {
    // Display
    color: [25, 181, 254],
    secondary: [103, 128, 159],
    weight: 1,
    // Misc
    name: 'laser',
    title: 'Laser Tower',
    // Stats
    cooldoonMax: 1,
    cost: 75,
    damageMax: 2,
    range: 3,
    type: 'energy'
};

tower.sniper = {
    // Display
    baseOnTop: false,
    color: [207, 0, 15],
    follow: false,
    length: 0.5,
    radius: 0.6,
    secondary: [103, 128, 159],
    weight: 3,
    width: 1.1,
    // Misc
    name: 'sniper',
    title: 'Sniper Tower',
    // Stats
    cooldownMax: 140,
    cooldownMin: 100,
    cost: 200,
    damageMax: 100,
    damageMin: 100,
    range: 9,
    target: 'furthest',
    // Methods
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
