class Missile {
    constructor(x, y, e) {
        // Physics
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        // Display
        this.color = [207, 0, 15];
        this.secondary = [189, 195, 199];
        this.length = 0.6 * ts;
        this.width = 0.2 * ts;
        // Misc
        this.alive = true;
        this.target = e;
        // Stats
        this.accAmt = 0.6;
        this.blastRadius = 1;
        this.damageMax = 60;
        this.damageMin = 40;
        this.lifetime = 60;
        this.range = 7;
        this.topSpeed = (4 * 24) / ts;
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        stroke(0);
        fill(this.secondary);
        var base = this.length / 2;
        var side = this.width / 2;
        var tip = base + this.width * 2;
        var back = -base - base * 2 / 3;
        var fin = side * 4;
        rect(-base, -side, base * 2, side * 2);
        fill(this.color);
        triangle(base, -side, tip, 0, base, side);
        triangle(-base, side, back, fin, 0, side);
        triangle(-base, -side, back, -fin, 0, -side);

        pop();
    }

    explode() {
        if (!muteSounds) sounds.boom.play();
        this.kill();
        var t = this.pos;
        var inRadius = getInRange(t.x, t.y, this.blastRadius, enemies);
        noStroke();
        fill(this.color[0], this.color[1], this.color[2], 127);
        var r = (this.blastRadius + 0.5) * ts * 2;
        if (showEffects) {
            var s = new RocketExplosion(this.pos.x, this.pos.y);
            for (var i = 0; i < particleAmt; i++) {
                s.addParticle();
            }
            systems.push(s);
        }
        ellipse(t.x, t.y, r, r);
        for (var i = 0; i < inRadius.length; i++) {
            var e = inRadius[i];
            var damage = round(random(this.damageMax, this.damageMin));
            e.dealDamage(damage, 'explosion');
        }
        this.kill();
    }

    findTarget() {
        var entities = this.visible(enemies);
        if (entities.length === 0) {
            this.kill();
            return;
        }
        var t = getTaunting(entities);
        if (t.length > 0) entities = t;
        var e = getNearest(entities, this.pos);
        if (typeof e === 'undefined') {
            this.kill();
            return;
        }
        this.target = e;
    }

    isDead() {
        return !this.alive;
    }

    kill() {
        this.alive = false;
    }

    reachedTarget() {
        var p = this.pos;
        var c = this.target.pos;
        return insideCircle(p.x, p.y, c.x, c.y, this.target.radius * ts);
    }

    steer() {
        if (!this.target.alive) return;
        var dist = this.pos.dist(this.target.pos);
        var unit = p5.Vector.sub(this.target.pos, this.pos).normalize();
        this.acc.add(unit.mult(this.accAmt));
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.topSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        if (!this.target.alive) this.findTarget();
        if (this.lifetime > 0) {
            this.lifetime--;
        } else {
            this.explode();
        }
    }

    // Returns array of visible entities out of passed array
    visible(entities) {
        return getInRange(this.pos.x, this.pos.y, this.range, entities);
    }
}
