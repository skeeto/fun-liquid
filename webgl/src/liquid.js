var bottle = null;
window.addEventListener('load', function() {
    var ctx = document.getElementById('display').getContext('2d');
    bottle = new Bottle(ctx);
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
