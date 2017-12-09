class Tower {
    constructor(col, row) {
        // Display
        this.baseOnTop = true;      // render base over barrel
        this.border = [0, 0, 0];    // border color
        this.color = [0, 0, 0];     // main color
        this.drawLine = true;       // draw line to enemy on attack
        this.follow = true;         // follow target even when not firing
        this.hasBarrel = true;
        this.hasBase = true;
        this.length = 0.7;          // barrel length in tiles
        this.radius = 1;            // radius in tiles
        this.secondary = [0, 0, 0]; // secondary color
        this.weight = 2;            // laser stroke weight
        this.width = 0.3;           // barrel width in tiles
        // Misc
        this.alive = true;
        this.name = 'tower';
        this.target = 'furthest';   // targeting function
        // Position
        this.angle = 0;
        this.gridPos = createVector(col, row);
        this.pos = createVector(col*ts + ts/2, row*ts + ts/2);
        // Stats
        this.cooldownMax = 0;
        this.cooldownMin = 0;
        this.cost = 0;
        this.damageMax = 25;
        this.damageMin = 1;
        this.range = 5;
        this.type = 'physical';     // damage type
    }

    aim(x, y) {
        this.angle = atan2(y - this.pos.y, x - this.pos.x);
    }

    attack(e) {
        var damage = round(random(this.damageMin, this.damageMax));
        e.dealDamage(damage, this.type);
    }

    canFire() {
        return this.cd === 0;
    }

    draw() {
        // Draw turret base
        if (this.hasBase && !this.baseOnTop) this.drawBase();
        // Draw barrel
        if (this.hasBarrel) {
            push();
            translate(this.pos.x, this.pos.y);
            rotate(this.angle);
            this.drawBarrel();
            pop();
        }
        // Draw turret base
        if (this.hasBase && this.baseOnTop) this.drawBase();
    }

    drawBarrel() {
        stroke(this.border);
        fill(this.secondary);
        rect(0, -this.width * ts / 2, this.length * ts, this.width * ts);
    }

    drawBase() {
        stroke(this.border);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.radius * ts, this.radius * ts);
    }

    kill() {
        this.alive = false;
    }

    onAim(e) {
        if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
        if (!this.canFire()) return;
        this.resetCooldown();
        this.attack(e);
        // Draw line to target
        if (!doLine || !this.drawLine) return;
        stroke(this.color);
        strokeWeight(this.weight);
        line(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
        strokeWeight(1);
    }

    onCreate() {
        this.cd = 0;                // current cooldown left
        this.totalCost = this.cost;
    }

    onTarget(entities) {
        var e = target[this.target](this.visible(entities));
        if (typeof e === 'undefined') return;
        this.onAim(e);
    }

    resetCooldown() {
        var cooldown = round(random(this.cooldownMin, this.cooldownMax));
        this.cd = cooldown;
    }

    // Sell price
    sellPrice() {
        return this.totalCost * sellConst;
    }

    update() {
        if (this.cd > 0) this.cd--;
    }

    upgrade(template) {
        template = typeof template === 'undefined' ? {} : template;
        var keys = Object.keys(template);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            this[key] = template[key];
        }
    }

    // Returns array of visible entities out of passed array
    visible(entities) {
        var visible = [];
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            var c = this.pos;
            if (insideCircle(e.pos.x, e.pos.y, c.x, c.y, this.range * ts)) {
                visible.push(e);
            }
        }
        return visible;
    }
}
