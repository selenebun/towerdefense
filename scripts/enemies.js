function createEnemy(x, y, template) {
    var e = new Enemy(x, y);
    // Fill in all keys
    template = typeof template === 'undefined' ? {} : template;
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        e[key] = template[key];
    }
    e.onCreate();
    return e;
}


var enemy = {};


enemy.weak = {
    // Display
    color: [145, 180, 150],
    // Misc
    name: 'weak'
};

enemy.strong = {
    // Display
    color: [30, 130, 76],
    radius: 0.6,
    // Misc
    name: 'strong',
    // Stats
    cash: 2,
    health: 75
};

enemy.fast = {
    // Display
    color: [61, 251, 255],
    // Misc
    name: 'fast',
    // Stats
    cash: 4,
    health: 75,
    speed: 2,
    drawEnemy: function() {
        stroke(0);
		fill(this.getColor());
        var back = -0.6 * ts / 3;
        var front = back + 0.6 * ts;
        var side = 0.9 * ts / 2;
		quad(back, -side, 0, 0, back, side, front, 0);
    }
};

enemy.taunt = {
    // Display
    color: [145, 61, 136],
    radius: 0.7,
    // Misc
    name: 'taunt',
    // Stats
    cash: 8,
    health: 375,
    drawEnemy: function() {
        stroke(0);
        fill(this.getColor());
        var edge = this.radius * ts / 2;
        rect(-edge, -edge, this.radius * ts, this.radius * ts);
    }
}
