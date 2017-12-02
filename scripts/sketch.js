// Main p5 functions

function setup() {
    // Properly size canvas and place inside div
    var div = document.getElementById('sketch-holder');
    var w = div.offsetWidth;
    var canvas = createCanvas(w, div.offsetHeight);
    canvas.parent('sketch-holder');
    resizeCanvas(w, div.offsetHeight);
}

function draw() {
    background(34, 49, 63);
}
