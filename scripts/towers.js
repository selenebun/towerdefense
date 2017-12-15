function createTower(x, y, template) {
    var t = new Tower(x, y);
    t.upgrade(template);
    t.onCreate();
    return t;
}


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
    cooldownMax: 1,
    cost: 75,
    damageMax: 3,
    range: 2,
    type: 'energy'
};

tower.slow = {
    // Display
    baseOnTop: false,
    color: [68, 108, 179],
    length: 1.3,
    secondary: [103, 128, 159],
    weight: 3,
    // Misc
    name: 'slow',
    title: 'Slow Tower',
    // Stats
    cooldownMax: 20,
    cooldownMin: 10,
    cost: 75,
    damageMax: 0,
    damageMin: 0,
    range: 4,
    type: 'chemical',
    drawBarrel: function() {
        stroke(this.border);
        fill(this.secondary);
        var back = -this.length * ts / 2;
        var side = this.width * ts / 2;
        rect(back, -side, this.length * ts, this.width * ts);
    },
    onHit: function(e) {
        e.applyEffect('slow', 40);
    }
}

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
