function Bottle(ctx) {
    this.ctx = ctx;
    this.width = Bottle.WIDTH;
    this.height = Bottle.HEIGHT;

    this.world = new B.World(Bottle.GRAVITY, false);
    this.polys = [];
    this.buildOuter();
    this.addSpike(new B.Vec2( Bottle.SPIKE_EXTENT, 0),  1);
    this.addSpike(new B.Vec2(-Bottle.SPIKE_EXTENT, 0), -1);
    this.balls = [];
    for (var i = 0; i < Bottle.BALL_COUNT; i++) {
        this.addBall();
    }
    this.fps = new FPS();
}

Bottle.WIDTH = 50;
Bottle.HEIGHT = 70;
Bottle.BALL_COUNT = 150;
Bottle.BALL_RADIUS = 1;
Bottle.BALL_DENSITY = 1;
Bottle.BALL_FRICTION = 0;
Bottle.BALL_RESTITUTION = 0.3;
Bottle.GRAVITY = new B.Vec2(0, -20);
Bottle.NGRAVITY = new B.Vec2(0, -Bottle.GRAVITY.get_y());
Bottle.FLIP_RATE = 2;
Bottle.SPIKE_THICKNESS = 12;
Bottle.SPIKE_EXTENT = 20;

Bottle.prototype.buildOuter = function() {
    var thickness = 0.1;
    var box = new B.PolygonShape(), def = new B.BodyDef();

    def.set_position(new B.Vec2(this.width / 2, 0));
    box.SetAsBox(thickness / 2, this.height / 2);
    this.world.CreateBody(def).CreateFixture(box, 0);

    def.set_position(new B.Vec2(-this.width / 2, 0));
    box.SetAsBox(thickness / 2, this.height / 2);
    this.world.CreateBody(def).CreateFixture(box, 0);

    def.set_position(new B.Vec2(0, this.height / 2));
    box.SetAsBox(this.width / 2, thickness / 2);
    this.world.CreateBody(def).CreateFixture(box, 0);

    def.set_position(new B.Vec2(0, -this.height / 2));
    box.SetAsBox(this.width / 2, thickness / 2);
    this.world.CreateBody(def).CreateFixture(box, 0);
};

Bottle.prototype.addSpike = function(pos, dir) {
    var thickness = Bottle.SPIKE_THICKNESS;
    var def = new B.BodyDef();
    def.set_position(pos);
    var verts = [
        new B.Vec2(dir * this.width / 2 - pos.get_x(), dir *  thickness / 2),
        new B.Vec2(0, 0),
        new B.Vec2(dir * this.width / 2 - pos.get_x(), dir * -thickness / 2)
    ];
    this.polys.push({pos: pos, verts: verts});
    var fix = new B.FixtureDef();
    fix.set_shape(createPolygonShape(verts));
    fix.set_density(1.0);
    fix.set_friction(0);
    this.world.CreateBody(def).CreateFixture(fix);
};

Bottle.prototype.random = function() {
    return new B.Vec2(Math.random() * this.width - (this.width / 2),
                      Math.random() * this.height - (this.height / 2));
};

Bottle.prototype.addBall = function(pos) {
    pos = pos || this.random();
    var def = new B.BodyDef();
    def.set_position(pos);
    def.set_type(B.b2_dynamicBody);
    var circle = new B.CircleShape();
    circle.set_m_radius(Bottle.BALL_RADIUS);
    var mass = new B.FixtureDef();
    mass.set_shape(circle);
    mass.set_density(Bottle.BALL_DENSITY);
    mass.set_friction(Bottle.BALL_FRICTION);
    mass.set_restitution(Bottle.BALL_RESTITUTION);
    this.balls.push(this.world.CreateBody(def).CreateFixture(mass));
};

Bottle.prototype.draw = function(f) {
    try {
        var w = this.ctx.canvas.width,
            h = this.ctx.canvas.height;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, w, h);
        this.ctx.save();
        this.ctx.translate(w / 2, h / 2);
        this.ctx.scale(w / this.width, h / this.height);
        f(this.ctx);
    } finally {
        this.ctx.restore();
    }
};

Bottle.prototype.render = function() {
    var balls = this.balls, polys = this.polys;
    this.draw(function(ctx) {
        ctx.fillStyle = 'white';
        balls.forEach(function(ball) {
            var pos = ball.GetBody().GetPosition();
            var x = pos.get_x(), y = pos.get_y();
            ctx.beginPath();
            ctx.arc(x, y, Bottle.BALL_RADIUS, 0, 2 * Math.PI);
            ctx.fill();
        });
        ctx.fillStyle = 'gray';
        polys.forEach(function(poly) {
            var v = poly.verts, p = poly.pos;
            ctx.beginPath();
            ctx.moveTo(v[0].get_x() + p.get_x(), v[0].get_y() + p.get_y());
            for (var i = 1; i < v.length; i++) {
                ctx.lineTo(v[i].get_x() + p.get_x(), v[i].get_y() + p.get_y());
            }
            ctx.fill();
        });
    });
};

Bottle.prototype.step = function() {
    this.fps.tick();
    var time = Date.now() / 1000;
    if (Math.sin(time / Bottle.FLIP_RATE * Math.PI) < 0) {
        this.world.SetGravity(Bottle.NGRAVITY);
    } else {
        this.world.SetGravity(Bottle.GRAVITY);
    }
    this.world.Step(1 / 30, 8, 3);
};

var bottle = null;
window.addEventListener('load', function() {
    var ctx = document.getElementById('display').getContext('2d');
    bottle = new Bottle(ctx);
    function render() {
        bottle.step();
        bottle.render();
        window.requestAnimationFrame(render);
    }
    window.requestAnimationFrame(render);
});

// window.addEventListener('devicemotion', function(event) {
//     var a = event.accelerationIncludingGravity;
//     var g = new Vec2(-a.x, a.y);
//     g.Multiply(100);
//     world.m_gravity = g;
// });
