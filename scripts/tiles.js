function createTile(template) {
    var t = new Tile();
    // Fill in all keys
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        t[key] = template[key];
    }
    return t;
}

var tiles = {};

// Path tiles

tiles.path = createTile({
    placeable: false,
    walkable: true,
    color: [51, 110, 123],
    drawBorder: false
});

tiles.start = createTile({
    placeable: false,
    walkable: true,
    color: [0, 230, 64],
    drawBorder: false
});

tiles.end = createTile({
    placeable: false,
    walkable: true,
    color: [207, 0, 15],
    drawBorder: false
});


// Tower tiles

tiles.platform = createTile({
    color: [34, 49, 63],
});
