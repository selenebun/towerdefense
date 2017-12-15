function createEffect(duration, template) {
    var e = new Effect(duration);
    // Fill in all keys
    template = typeof template === 'undefined' ? {} : template;
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        e[key] = template[key];
    }
    return e;
}


var effects = {};


effects.slow = {
    // Display
    color: [68, 108, 179],
    // Misc
    name: 'slow',
    // Methods
    onEnd: function(e) {
        e.speed = this.oldSpeed;
    },
    onStart: function(e) {
        this.oldSpeed = e.speed;
        this.speed = e.speed / 2;
        e.speed = this.speed;
    }
};
