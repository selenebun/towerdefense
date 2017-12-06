class Tower {
    constructor(col, row) {
        // Display
        this.barrel = [0, 0, 0];
        this.color = [0, 0, 0];
        this.hasBarrel = false;
        this.length = 0.7;          // barrel length in tiles
        this.width = 0.4;           // barrel width in tiles
        this.radius = 1;            // radius in tiles
        // Misc
        this.alive = true;
        this.name = 'tower';
        this.type = 'tower';
        // Position
        this.angle = 0;
        this.gridPos = createVector(col, row);
        this.pos = createVector(col*ts + ts/2, row*ts + ts/2);
        // Stats
        this.cooldown = 10;
        this.damage = 1;
        this.range = 5;
    }

    aim(x, y) {
        this.angle = atan2(y - this.pos.y, x - this.pos.x);
    }

    draw() {
        // Draw barrel
        stroke(0);
        if (this.hasBarrel) {
            push();
            translate(this.pos.x, this.pos.y);
            rotate(this.angle);
            this.drawBarrel();
            pop();
        }
        // Draw turret
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.radius * ts, this.radius * ts);
    }

    drawBarrel() {
        fill(this.barrel);
        rect(0, -this.width * ts / 2, this.length * ts, this.width * ts);
    }

    kill() {
        this.alive = false;
    }

    nearest(entities) {
        var lowestDist = 10000;
        var e = entities[0];
        for (var i = 0; i < entities.length; i++) {
            var dist = this.pos.dist(entities[i].pos);
            if (dist < lowestDist) {
                lowestDist = dist;
                e = entities[i];
            }
        }
        return e;
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
