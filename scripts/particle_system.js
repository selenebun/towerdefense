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
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.run();

            if (p.isDead()) this.particles.splice(i, 1);
        }
    }
}


class RocketExplosion extends ParticleSystem {
    constructor(x, y) {
        super(x, y);
    }

    addParticle() {
        this.particles.push(new Fire(this.origin, 5));
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

class ShrapnelExplosion extends ParticleSystem {
    constructor(x, y) {
        super(x, y);
    }

    addParticle() {
        this.particles.push(new Shrapnel(this.origin, 5));
    }
}
