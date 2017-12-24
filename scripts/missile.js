class Missile {
    constructor(x, y, vx, vy, e) {
        // Physics
        this.pos = createVector(x, y);
        this.vel = createVector(vx, vy);
        this.acc = createVector(0, 0);
        this.accAmt = 0.6;
        // Display
        this.color = [207, 0, 15];
        this.length = 0.6 * ts;
        this.width = 0.2 * ts;
        // Misc
        this.alive = true;
        this.lifetime = 40;
        this.range = 4;
        this.target = e;
    }

    // Deal damage to enemy
    attack() {
        var t = this.pos;
        var blastRadius = 1;
        var inRadius = getInRange(t.x, t.y, blastRadius, enemies);
        noStroke();
        fill(207, 0, 15, 127);
        ellipse(t.x, t.y, ts * 2.5, ts * 2.5);
        for (var i = 0; i < inRadius.length; i++) {
            var e = inRadius[i];
            var damage = round(random(40, 60));
            e.dealDamage(damage, 'explosion');
        }
        this.kill();
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        stroke(0);
        fill(189, 195, 199);
        var base = this.length / 2;
        var side = this.width / 2;
        var tip = base + this.width * 2;
        var back = -base - base * 2 / 3;
        var fin = side * 4;
        rect(-base, -side, base * 2, side * 2);
        fill(207, 0, 15);
        triangle(base, -side, tip, 0, base, side);
        triangle(-base, side, back, fin, 0, side);
        triangle(-base, -side, back, -fin, 0, -side);

        pop();
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
        this.vel.limit(96 / ts);
        this.pos.add(this.vel);
        this.acc.mult(0);
        if (!this.target.alive) this.findTarget();
        if (this.lifetime > 0) {
            this.lifetime--;
        } else {
            this.attack();
            this.kill;
        }
    }

    // Returns array of visible entities out of passed array
    visible(entities) {
        return getInRange(this.pos.x, this.pos.y, this.range, entities);
    }
}
