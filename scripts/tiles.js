function createTile(col, row, template) {
    var t = new Tile(col, row);
    // Fill in all keys
    template = typeof template === 'undefined' ? {} : template;
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        t[key] = template[key];
    }
    return t;
}


var tiles = {};


// Normal tiles

tiles.null = {
    name: 'null',
    canPlace: false
};

tiles.empty = {
    canWalk: true,
    color: [236, 236, 236]
};

tiles.wall = {
    name: 'wall',
    canPlace: false,
    color: [108, 122, 137]
}

tiles.spawner = {
    name: 'spawner',
    canPlace: false,
    color: [0, 230, 64]
};

tiles.exit = {
    name: 'exit',
    canPlace: false,
    color: [207, 0, 15]
};


// Towers
