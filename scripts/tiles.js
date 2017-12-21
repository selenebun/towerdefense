var tiles = {
    // Basic
    empty: null,
    tower: [51, 110, 123],
    wall: [1, 50, 67],
    // City
    grass: [30, 130, 76],
    lCorner: function(x, y, dir) {
        if (dir === 0) return;
        push();
        var c = center(x, y);
        translate(c.x, c.y);
        rotate([0, PI / 2, PI, PI * 3 / 2][dir - 1]);

        noStroke();
        fill(250, 210, 1);
        var edge = 0.05 * ts;
        var end = 0.25 * ts;
        quad(-end, -edge, -end, edge, -edge, end, edge, end);

        pop();
    },
    rCorner: function(x, y, dir) {
        if (dir === 0) return;
        push();
        var c = center(x, y);
        translate(c.x, c.y);
        rotate([PI / 2, PI, PI * 3 / 2, 0][dir - 1]);
    
        noStroke();
        fill(250, 210, 1);
        var edge = 0.05 * ts;
        var end = 0.25 * ts;
        quad(-end, -edge, -end, edge, -edge, end, edge, end);
    
        pop();
    },
    road: function(x, y, dir) {
        if (dir === 0) return;
        push();
        var c = center(x, y);
        translate(c.x, c.y);
        rotate([0, PI / 2][(dir - 1) % 2]);

        noStroke();
        fill(250, 210, 1);
        var side = 0.05 * ts;
        var back = 0.15 * ts;
        rect(-back, -side, back * 2, side * 2);

        pop();
    },
    sidewalk: [149, 165, 166]
};
