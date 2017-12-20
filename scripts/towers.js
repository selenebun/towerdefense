function createTower(x, y, template) {
    var t = new Tower(x, y);
    t.upgrade(template);
    t.onCreate();
    return t;
}


var tower = {};


tower.gun = {
    // Display
    color: [232, 126, 4],
    length: 0.65,
    radius: 0.9,
    secondary: [149, 165, 166],
    // Misc
    name: 'gun',
    title: 'Gun Tower',
    // Stats
    cooldownMax: 18,
    cooldownMin: 8,
    cost: 25,
    range: 3,
    // Upgrades
    upgrades: [
        {
            // Display
            color: [211, 84, 0],
            // Misc
            title: 'Machine Gun',
            // Stats
            cooldownMax: 5,
            cooldownMin: 0,
            cost: 75,
            damageMax: 10,
            damageMin: 0
        }
    ]
};

tower.laser = {
    // Display
    color: [25, 181, 254],
    length: 0.55,
    radius: 0.8,
    secondary: [149, 165, 166],
    width: 0.25,
    // Misc
    name: 'laser',
    title: 'Laser Tower',
    // Stats
    cooldownMax: 1,
    cost: 75,
    damageMax: 2,
    range: 2,
    type: 'energy',
    // Upgrades
    upgrades: [
        {
            // Display
            color: [78, 205, 196],
            length: 0.65,
            radius: 0.9,
            secondary: [191, 191, 191],
            weight: 3,
            width: 0.35,
            // Misc
            title: 'Beam Emitter',
            // Stats
            cooldownMax: 0,
            cost: 275,
            damageMax: 0.1,
            damageMin: 0.001,
            range: 3,
            // Methods
            attack: function(e) {
                if (this.lastTarget === e) {
                    this.duration++;
                } else {
                    this.lastTarget = e;
                    this.duration = 0;
                }
                //var damage = this.damageMin * pow(2, this.duration);
                var d = random(this.damageMin, this.damageMax);
                var damage = d * sq(this.duration);
                e.dealDamage(damage, this.type);
                this.onHit(e);
            }
        }
    ]
};

tower.slow = {
    // Display
    baseOnTop: false,
    color: [75, 119, 190],
    drawLine: false,
    length: 1.1,
    radius: 0.9,
    secondary: [189, 195, 199],
    width: 0.3,
    // Misc
    name: 'slow',
    title: 'Slow Tower',
    // Stats
    cooldownMax: 0,
    cooldownMin: 0,
    cost: 100,
    damageMax: 0,
    damageMin: 0,
    range: 1,
    type: 'slow',
    // Methods
    drawBarrel: function() {
        stroke(this.border);
        fill(this.secondary);
        var back = -this.length * ts / 2;
        var side = this.width * ts / 2;
        rect(back, -side, this.length * ts, this.width * ts);
    },
    onAim: function(e) {
        if (!this.canFire()) return;
        this.resetCooldown();
        this.attack(e);
    },
    onHit: function(e) {
        e.applyEffect('slow', 40);
    },
    // Target correct enemy
    target: function(entities) {
        entities = this.visible(entities);
        if (entities.length === 0) return;
        noStroke();
        fill(75, 119, 190, 127);
        ellipse(this.pos.x, this.pos.y, 3 * ts, 3 * ts);
        for (var i = 0; i < entities.length; i++) {
            this.onAim(entities[i]);
        }
    },
    update() {
        this.angle += PI / 60;
        if (this.cd > 0) this.cd--;
    },
    // Upgrades
    upgrades: [
        {
            // Display
            color: [102, 204, 26],
            drawLine: true,
            hasBase: false,
            radius: 0.9,
            // Misc
            name: 'poison',
            title: 'Poison Tower',
            // Stats
            cooldownMax: 30,
            cooldownMin: 30,
            cost: 50,
            range: 2,
            // Methods
            drawBarrel: function() {
                stroke(0);
                fill(this.color);
                var height = this.radius * ts * sqrt(3) / 2;
                var back = -height / 3;
                var front = height * 2 / 3;
                var side = this.radius * ts / 2;
                triangle(back, -side, back, side, front, 0);
            },
            onAim: function(e) {
                if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
                if (!this.canFire()) return;
                this.resetCooldown();
                this.attack(e);
                // Draw line to target
                if (!this.drawLine) return;
                stroke(this.color);
                strokeWeight(this.weight);
                line(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
                strokeWeight(1);
            },
            onHit: function(e) {
                e.applyEffect('poison', 40);
            },
            target: function(entities) {
                entities = this.visible(entities);
                if (entities.length === 0) return;
                entities = getNoEffect(entities, 'poison');
                console.log(entities);
                if (entities.length === 0) return;
                var t = getTaunting(entities);
                if (t.length > 0) entities = t;
                var e = getFirst(entities);
                if (typeof e === 'undefined') return;
                this.onAim(e);
            },
            update: function() {
                if (this.cd > 0) this.cd--;
            }
        }
    ]
};

tower.sniper = {
    // Display
    baseOnTop: false,
    color: [207, 0, 15],
    follow: false,
    length: 0.5,
    radius: 0.6,
    secondary: [103, 128, 159],
    weight: 3,
    width: 1.1,
    // Misc
    name: 'sniper',
    title: 'Sniper Tower',
    // Stats
    cooldownMax: 140,
    cooldownMin: 100,
    cost: 200,
    damageMax: 100,
    damageMin: 100,
    range: 9,
    // Methods
    drawBarrel: function() {
        stroke(this.border);
        fill(this.color);
        var back = -this.length * ts / 3;
        var front = back + this.length * ts;
        var side = this.width * ts / 2;
        triangle(back, -side, back, side, front, 0);
    },
    drawBase: function() {
        stroke(this.border);
        fill(this.secondary);
        ellipse(this.pos.x, this.pos.y, this.radius * ts, this.radius * ts);
    }
};

tower.bomb = {
    // Display
    baseOnTop: false,
    color: [102, 51, 153],
    secondary: [103, 128, 159],
    // Misc
    name: 'bomb',
    title: 'Bomb Tower',
    // Stats
    cooldownMin: 40,
    cooldownMax: 60,
    cost: 300,
    damageMax: 60,
    damageMin: 20,
    range: 2,
    type: 'explosion',
    // Methods
    drawBarrel: function() {
        stroke(this.border);
        fill(this.secondary);
        rect(0, -this.width * ts / 2, this.length * ts, this.width * ts);
        fill(191, 85, 236);
        ellipse(0, 0, this.radius * ts * 2 / 3, this.radius * ts * 2 / 3);
    },
    onHit: function(e) {
        var blastRadius = 1;
        var inRadius = getInRange(e.pos.x, e.pos.y, blastRadius, enemies);
        noStroke();
        fill(102, 51, 153, 127);
        ellipse(e.pos.x, e.pos.y, ts * 2.5, ts * 2.5);
        for (var i = 0; i < inRadius.length; i++) {
            var h = inRadius[i];
            var amt = round(random(this.damageMin, this.damageMax));
            h.dealDamage(amt, this.type);
        }
    }
};
