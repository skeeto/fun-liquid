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

    document.getElementById('doBlur')
        .addEventListener('change', function() {
            bottle.doBlur = this.checked;
        });
    document.getElementById('doThreshold')
        .addEventListener('change', function() {
            bottle.doThreshold = this.checked;
        });
});
