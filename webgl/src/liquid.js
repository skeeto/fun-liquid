var bottle = null;
window.addEventListener('load', function() {
    bottle = new Bottle(document.getElementById('display'));
    function step() {
        bottle.step();
    }
    function render() {
        bottle.render();
        window.requestAnimationFrame(render);
    }
    window.requestAnimationFrame(render);
    setInterval(step, 1000 / Bottle.FPS);
});

// window.addEventListener('devicemotion', function(event) {
//     var a = event.accelerationIncludingGravity;
//     var g = new Vec2(-a.x, a.y);
//     g.Multiply(100);
//     world.m_gravity = g;
// });
