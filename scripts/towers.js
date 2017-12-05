function createTower(x, y, template) {
    var t = new Tower(x, y);
    // Fill in all keys
    template = typeof template === 'undefined' ? {} : template;
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        t[key] = template[key];
    }
    return t;
}


var tower = {};


tower.laser = {
    name: 'laser turret',
    color: [25, 181, 254],
    barrel: [103, 128, 159],
    showBarrel: true
};
