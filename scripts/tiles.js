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
    sidewalk: [149, 165, 166],
    // Neon
    neon_pink: [255, 0, 153],
    neon_yellow: [243, 243, 21],
    neon_green: [131, 245, 44],
    neon_orange: [255, 102, 0],
    neon_purple: [110, 13, 208],
    // Color Set 0
    c0_lightBrown: [206, 171, 171],
    c0_lightPurple: [123, 95, 167],
    c0_mediumPurple: [117, 65, 129],
    c0_darkPurple: [55, 12, 63],
    c0_paleGreen: [212, 244, 194],
    // Color Set 1
    c1_darkBlue: [10, 25, 50],
    c1_mediumBlue: [22, 64, 122],
    c1_lightBlue: [34, 189, 197],
    c1_darkPurple: [112, 35, 143],
    c1_neonPink: [232, 33, 215],
    // Color Set 2
    c2_darkRed: [135, 6, 13],
    c2_navyBlue: [1, 18, 57],
    c2_darkBlue: [3, 36, 97],
    c2_paleYellow: [232, 228, 197],
    c2_lightYellow: [248, 241, 193]
};
