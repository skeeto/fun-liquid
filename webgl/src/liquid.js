function Bottle(ctx) {
    this.ctx = ctx;
    this.width = Bottle.WIDTH;
    this.height = Bottle.HEIGHT;

    this.world = new B.World(Bottle.GRAVITY, false);
    this.buildOuter();
    this.addSpike(new B.Vec2( Bottle.SPIKE_EXTENT, 0),  1);
    this.addSpike(new B.Vec2(-Bottle.SPIKE_EXTENT, 0), -1);
    for (var i = 0; i < Bottle.BALL_COUNT; i++) {
        this.addBall();
    }
}

Bottle.WIDTH = 50;
Bottle.HEIGHT = 70;
Bottle.BALL_COUNT = 400;
Bottle.BALL_RADIUS = 0.5;
Bottle.BALL_DENSITY = 1;
Bottle.BALL_FRICTION = 0;
Bottle.BALL_RESTITUTION = 0.3;
Bottle.GRAVITY = new B.Vec2(0, -20);
Bottle.NGRAVITY = Bottle.GRAVITY.GetNegative();
Bottle.FLIP_RATE = 3.5;
Bottle.SPIKE_THICKNESS = 12;
Bottle.SPIKE_EXTENT = 20;

Bottle.prototype.buildOuter = function() {
    var thickness = 0.1;
    var box, def = new B.BodyDef();

    def.position = new B.Vec2(this.width / 2, 0);
    box = B.PolygonShape.AsBox(thickness / 2, this.height / 2);
    this.world.CreateBody(def).CreateFixture2(box, 0);

    def.position = new B.Vec2(-this.width / 2, 0);
    box = B.PolygonShape.AsBox(thickness / 2, this.height / 2);
    this.world.CreateBody(def).CreateFixture2(box, 0);

    def.position = new B.Vec2(0, this.height / 2);
    box = B.PolygonShape.AsBox(this.width / 2, thickness / 2);
    this.world.CreateBody(def).CreateFixture2(box, 0);

    def.position = new B.Vec2(0, -this.height / 2);
    box = B.PolygonShape.AsBox(this.width / 2, thickness / 2);
    this.world.CreateBody(def).CreateFixture2(box, 0);
};

Bottle.prototype.addSpike = function(pos, dir) {
    var thickness = Bottle.SPIKE_THICKNESS;
    var def = new B.BodyDef();
    def.position = pos;
    var shape = new B.PolygonShape();
    var verts = [
        new B.Vec2(dir * this.width / 2 - pos.x, dir * thickness / 2),
        new B.Vec2(0, 0),
        new B.Vec2(dir * this.width / 2 - pos.x, dir * -thickness / 2)
    ];
    shape.SetAsArray(verts);
    var fix = new B.FixtureDef();
    fix.shape = shape;
    fix.density = 0;
    fix.friction = 0;
    this.world.CreateBody(def).CreateFixture(fix);
};

Bottle.prototype.random = function() {
    return new B.Vec2(Math.random() * this.width - (this.width / 2),
                      Math.random() * this.height - (this.height / 2));
};

Bottle.prototype.addBall = function(pos) {
    pos = pos || this.random();
    var def = new B.BodyDef();
    def.position = pos;
    def.type = B.Body.b2_dynamicBody;
    var circle = new B.CircleShape();
    circle.m_radius = Bottle.BALL_RADIUS;
    var mass = new B.FixtureDef();
    mass.shape = circle;
    mass.density = Bottle.BALL_DENSITY;
    mass.friction = Bottle.BALL_FRICTION;
    mass.restitution = Bottle.BALL_RESTITUTION;
    return this.world.CreateBody(def).CreateFixture(mass);
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
    var world = this.world;
    this.draw(function(ctx) {
        ctx.fillStyle = 'white';
        var body = world.GetBodyList();
        while (body) {
            var pos = body.GetPosition();
            var fix = body.GetFixtureList();
            if (body.GetType() === 0) {
                ctx.fillStyle = 'gray';
            }
            while (fix) {
                fix.GetShape().render(ctx, pos);
                fix = fix.m_next;
            }
            body = body.m_next;
        }
    });
};

Bottle.prototype.step = function() {
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
    var ctx = document.getElementById('world').getContext('2d');
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
