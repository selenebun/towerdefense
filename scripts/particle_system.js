class ParticleSystem {
    constructor(x, y) {
        this.origin = createVector(x, y);
        this.particles = [];
    }

    addParticle() {
        this.particles.push(new Particle(this.origin, 1))
    }

    isDead() {
        return this.particles.length === 0;
    }

    run() {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].run();
        }
        removeDead(this.particles);
    }
}


class RocketExplosion extends ParticleSystem {
    constructor(x, y) {
        super(x, y);
    }

    addParticle() {
        this.particles.push(new Fire(this.origin, 3));
    }
}


class BombExplosion extends ParticleSystem {
    constructor(x, y) {
        super(x, y);
    }

    addParticle() {
        this.particles.push(new Bomb(this.origin, 2));
    }
}
