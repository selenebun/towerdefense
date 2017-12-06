function createTower(x, y, template) {
    var t = new Tower(x, y);
    t.upgrade(template);
    return t;
}


var tower = {};

tower.laser = {
    // Display
    barrel: [103, 128, 159],
    color: [25, 181, 254],
    hasBarrel: true,
    // Misc
    name: 'laser',
    // Methods
    target: function(entities) {
        var e = this.nearest(getByType(entities, 'enemy'));
        if (typeof e === 'undefined') return;
        this.aim(e.pos.x, e.pos.y);
        stroke(this.color);
        line(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
    }
};

/*
var tower = {};


tower.laser = {
    toAffect: ['basic'],
    toTarget: ['basic'],
    name: 'laser',
    color: [25, 181, 254],
    barrel: [103, 128, 159],
    showBarrel: true,
    onTarget: function(e) {
        this.aim(e.pos.x, e.pos.y);
        stroke(this.color);
        var t = getCenter(this.pos.x, this.pos.y);
        line(t.x, t.y, e.pos.x, e.pos.y);
    }
};
*/
