function createTower(x, y, template) {
    var t = new Tower(x, y);
    t.upgrade(template);
    t.onCreate();
    return t;
}


var tower = {};


tower.gun = {
    // Display
    color: [249, 191, 59],
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
            color: [249, 105, 14],
            // Misc
            name: 'machineGun',
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
    damageMax: 3,
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
            name: 'beamEmitter',
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
        this.attack(e);
    },
    onHit: function(e) {
        e.applyEffect('slow', 40);
    },
    // Target correct enemy
    target: function(entities) {
        entities = this.visible(entities);
        if (entities.length === 0) return;
        if (!this.canFire()) return;
        this.resetCooldown();
        noStroke();
        fill(this.color[0], this.color[1], this.color[2], 127);
        var r = this.range * 2 + 1;
        ellipse(this.pos.x, this.pos.y, r * ts, r * ts);
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
            radius: 0.9,
            // Misc
            name: 'poison',
            title: 'Poison Tower',
            // Stats
            cooldownMax: 60,
            cooldownMin: 60,
            cost: 150,
            range: 2,
            type: 'poison',
            // Methods
            onHit: function(e) {
                e.applyEffect('poison', 60);
            }
        }
    ]
};

tower.sniper = {
    // Display
    color: [207, 0, 15],
    follow: false,
    hasBase: false,
    radius: 0.9,
    weight: 3,
    // Misc
    name: 'sniper',
    title: 'Sniper Tower',
    // Stats
    cooldownMax: 100,
    cooldownMin: 60,
    cost: 200,
    damageMax: 100,
    damageMin: 100,
    range: 9,
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
    target(entities) {
        entities = this.visible(entities);
        if (entities.length === 0) return;
        var t = getTaunting(entities);
        if (t.length > 0) entities = t;
        var e = getStrongest(entities);
        if (typeof e === 'undefined') return;
        this.onAim(e);
    },
    // Upgrades
    upgrades: [
        {
            // Display
            baseOnTop: false,
            color: [103, 65, 114],
            hasBase: true,
            length: 0.7,
            radius: 1,
            secondary: [103, 128, 159],
            weight: 4,
            width: 0.4,
            // Misc
            name: 'railgun',
            title: 'Railgun',
            // Stats
            cooldownMax: 120,
            cooldownMin: 100,
            cost: 300,
            damageMax: 200,
            damageMin: 200,
            range: 11,
            type: 'piercing',
            // Methods
            drawBarrel: function() {
                stroke(this.border);
                fill(this.secondary);
                var base = -this.length * ts;
                var side = -this.width * ts / 2;
                rect(base, side, this.length * ts * 2, this.width * ts);
                fill(207, 0, 15);
                ellipse(0, 0, this.radius * ts * 2 / 3, this.radius * ts * 2 / 3);
            },
            onHit: function(e) {
                var blastRadius = 1;
                var inRadius = getInRange(e.pos.x, e.pos.y, blastRadius, enemies);
                noStroke();
                fill(this.color[0], this.color[1], this.color[2], 127);
                ellipse(e.pos.x, e.pos.y, ts * 2.5, ts * 2.5);
                var s = new ShrapnelExplosion(e.pos.x, e.pos.y);
                for (var i = 0; i < 32; i++) {
                    s.addParticle();
                }
                systems.push(s);
                for (var i = 0; i < inRadius.length; i++) {
                    var h = inRadius[i];
                    var amt = round(random(this.damageMin, this.damageMax));
                    h.dealDamage(amt, this.type);
                }
            }
        }
    ]
};

tower.rocket = {
    // Display
    baseOnTop: false,
    color: [30, 130, 76],
    drawLine: false,
    length: 0.6,
    radius: 0.75,
    secondary: [189, 195, 199],
    width: 0.2,
    // Misc
    name: 'rocket',
    title: 'Rocket Tower',
    // Stats
    cooldownMax: 80,
    cooldownMin: 60,
    cost: 250,
    range: 7,
    damageMax: 60,
    damageMin: 40,
    type: 'explosion',
    // Methods
    drawBarrel: function() {
        stroke(this.border);
        fill(this.secondary);
        rect(0, -this.width * ts, this.length * ts, this.width * ts);
        rect(0, 0, this.length * ts, this.width * ts);
        fill(207, 0, 15);
        var mid = this.width * ts / 2;
        var base = this.length * ts;
        var tip = this.length * ts + this.width * ts * 2;
        var side = this.width * ts;
        triangle(base, -side, tip, -mid, base, 0);
        triangle(base, side, tip, mid, base, 0);
        fill(this.color);
        var edge = this.width * ts * 4;
        var fEdge = this.width * ts * 1.5;
        var back = -this.width * ts * 0.75;
        var front = this.width * ts * 1.25;
        quad(back, -edge, back, edge, front, fEdge, front, -fEdge);
    },
    drawBase: function() {
        stroke(this.border);
        fill(this.secondary);
        ellipse(this.pos.x, this.pos.y, this.radius * ts, this.radius * ts);
    },
    onAim(e) {
        if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
        if (!this.canFire()) return;
        this.resetCooldown();
        projectiles.push(new Missile(this.pos.x, this.pos.y, e));
    },
    // Upgrades
    upgrades: [
        {
            // Display
            color: [65, 131, 215],
            secondary: [108, 122, 137],
            // Misc
            name: 'missileSilo',
            title: 'Missile Silo',
            // Stats
            cost: 150,
            damageMax: 120,
            damageMin: 100,
            range: 9,
            // Methods
            drawBarrel: function() {
                stroke(this.border);
                fill(this.secondary);
                rect(0, -this.width * ts, this.length * ts, this.width * ts);
                rect(0, 0, this.length * ts, this.width * ts);
                fill(this.color);
                var mid = this.width * ts / 2;
                var base = this.length * ts;
                var tip = this.length * ts + this.width * ts * 2;
                var side = this.width * ts;
                triangle(base, -side, tip, -mid, base, 0);
                triangle(base, side, tip, mid, base, 0);
                fill(31, 58, 147);
                var edge = this.width * ts * 4;
                var fEdge = this.width * ts * 1.5;
                var back = -this.width * ts * 0.75;
                var front = this.width * ts * 1.25;
                quad(back, -edge, back, edge, front, fEdge, front, -fEdge);
            },
            onAim(e) {
                if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
                if (!this.canFire()) return;
                this.resetCooldown();
                var m = new Missile(this.pos.x, this.pos.y, e);
                m.color = [65, 131, 215];
                m.secondary = this.secondary;
                m.blastRadius = 1.5;
                m.damageMax = this.damageMax;
                m.damageMin = this.damageMin;
                m.topSpeed = 120 / ts;
                projectiles.push(m);
            },
        }
    ]
};

tower.bomb = {
    // Display
    baseOnTop: false,
    color: [102, 51, 153],
    drawLine: false,
    length: 0.6,
    width: 0.35,
    secondary: [103, 128, 159],
    // Misc
    name: 'bomb',
    title: 'Bomb Tower',
    // Stats
    cooldownMax: 60,
    cooldownMin: 40,
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
        fill(191, 85, 236, 127);
        ellipse(e.pos.x, e.pos.y, ts * 2.5, ts * 2.5);
        var s = new BombExplosion(e.pos.x, e.pos.y);
        for (var i = 0; i < 32; i++) {
            s.addParticle();
        }
        systems.push(s);
        for (var i = 0; i < inRadius.length; i++) {
            var h = inRadius[i];
            var amt = round(random(this.damageMin, this.damageMax));
            h.dealDamage(amt, this.type);
        }
    }
};
