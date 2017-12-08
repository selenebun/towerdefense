// TODO onCreate()
function createEnemy(x, y, template) {
    var e = new Enemy(x, y);
    // Fill in all keys
    template = typeof template === 'undefined' ? {} : template;
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        e[key] = template[key];
    }
    return e;
}


var enemy = {};

enemy.basic = {
    color: [154, 18, 179],
    name: 'basic'
};

enemy.fast = {
    color: [61, 251, 255],
    name: 'fast',
    cash: 8,
    damage: 5,
    health: 3,
    speed: 2
};

enemy.tank = {
    color: [150, 40, 27],
    name: 'tank',
    armor: 0.2,
    cash: 20,
    damage: 15,
    health: 10
};
