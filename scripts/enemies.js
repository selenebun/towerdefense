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
