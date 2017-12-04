class Enemy {
    constructor(x, y) {
        // Position
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        // Stats
        this.health = 1;
        this.armor = 0;
        this.damage = 1;
        this.speed = 1;
        // Misc
        this.name = 'enemy';
        this.alive = true;
        // Display
        this.color = [0, 0, 0];
        this.alpha = 255;
        this.radius = 5;
    }

    // TODO account for armor
    attack(amount) {
        this.health -= amount;
        if (this.health <= 0) this.kill();
    }

    draw() {
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        stroke(0);
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
    }

    kill() {
        this.alive = false;
    }

    onDeath() {}
    onTick() {}

    steer(angle) {
        var vx = this.speed * cos(angle);
        var vy = this.speed * sin(angle);
        this.vel = createVector(vx, vy);
    }

    update() {
        this.pos.add(this.vel);
    }
}
