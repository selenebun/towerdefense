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

/*


var enemy = {};


enemy.basic = {
    health: 5,
    cooldown: 0,
    speed: 1,
    name: 'basic',
    color: [154, 18, 179],
    onTarget: function(e) {
        this.aim(e);
        stroke(154, 18, 179);
        var t = getCenter(this.pos.x, this.pos.y);
        line(t.x, t.y, e.pos.x, e.pos.y);
    }
};
*/
