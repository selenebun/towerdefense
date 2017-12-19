var tiles = {
    // Basic
    empty: null,
    tower: [51, 110, 123],
    wall: [1, 50, 67],
    // Roads
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
    }
};
