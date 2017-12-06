class Tower {
    constructor(col, row) {
        // Display
        this.barrel = [0, 0, 0];    // barrel color
        this.border = [0, 0, 0];    // border color
        this.color = [0, 0, 0];     // turret base color
        this.hasBarrel = true;
        this.hasBase = true;
        this.length = 0.7;          // barrel length in tiles
        this.radius = 1;            // radius in tiles
        this.width = 0.3;           // barrel width in tiles
        // Misc
        this.alive = true;
        this.name = 'tower';
        // Position
        this.angle = 0;
        this.gridPos = createVector(col, row);
        this.pos = createVector(col*ts + ts/2, row*ts + ts/2);
        // Stats
        this.cd = 0;                // current cooldown left
        this.cooldown = 10;
        this.damage = 1;
        this.range = 5;
    }

    aim(x, y) {
        this.angle = atan2(y - this.pos.y, x - this.pos.x);
    }

    canFire() {
        return this.cd === 0;
    }

    draw() {
        // Draw barrel
        if (this.hasBarrel) {
            push();
            translate(this.pos.x, this.pos.y);
            rotate(this.angle);
            this.drawBarrel();
            pop();
        }
        // Draw turret base
        if (this.hasBase) this.drawBase();
    }

    drawBarrel() {
        stroke(this.border);
        fill(this.barrel);
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

    onAim(e) {}

    onTarget(entities) {
        var e = this.target(entities);
        if (typeof e === 'undefined') return;
        this.onAim(e);
    }

    resetCooldown() {
        this.cd = this.cooldown;
    }

    target() {}

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

/*
class Tower {
    attack(e) {}

    kill() {
        this.alive = false;
    }

    getNearest(enemies) {
        var lowestDist = 10000;
        var e = enemies[0];
        for (var i = 0; i < enemies.length; i++) {
            var t = getCenter(this.pos.x, this.pos.y);
            var dist = enemies[i].pos.dist(createVector(t.x, t.y));
            if (dist < lowestDist) {
                lowestDist = dist;
                e = enemies[i];
            }
        }
        return e;
    }

    onCreate() {
        this.cd = this.cooldown;
    }

    onDeath() {}
    onFire() {}
    onKill(e) {}
    onPlace() {}
    onSell() {}
    onTarget(e) {}
    onTick() {}
    onUpgrade() {}

    target(enemies) {
        if (this.cooldown > 0) return;
        var possible = getByName(enemies, this.toTarget);
        if (possible.length === 0) return;
        this.cd = this.cooldown;
        this.onTarget(this.getNearest(possible));
    }

    update() {
        if (this.cd > 0) this.cd--;
    }
}
*/
