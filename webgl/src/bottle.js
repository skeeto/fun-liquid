function Bottle(canvas) {
    this.width = Bottle.WIDTH;
    this.height = Bottle.HEIGHT;
    this.time = 0;
    this.threshold = 0.3;

    this.doBlur = true;
    this.doThreshold = true;

    this.world = new B.World(Bottle.GRAVITY, false);
    this.polys = [];
    this.buildOuter();
    this.addSpike(new B.Vec2( Bottle.SPIKE_EXTENT, 0),  1);
    this.addSpike(new B.Vec2(-Bottle.SPIKE_EXTENT, 0), -1);
    this.balls = [];
    for (var i = 0; i < Bottle.BALL_COUNT; i++) {
        this.addBall();
    }

    /* Rendering */
    this.fps = new FPS();
    try {
        var gl = this.gl = Igloo.getContext(canvas, true);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        function program(v, f) {
            return new Igloo.Program(gl, 'src/' + v, 'src/' + f);
        }
        this.programs = {
            balls:     program('ball.vert', 'ball.frag'),
            blur:      program('identity.vert', 'blur.frag'),
            threshold: program('identity.vert', 'threshold.frag'),
            spikes:    program('identity.vert', 'color.frag')
        };

        var spikes = [];
        var w = this.width, h = this.height;
        this.polys.forEach(function(poly) {
            var x = poly.pos.get_x(), y = poly.pos.get_y();
            poly.verts.forEach(function(vert) {
                spikes.push((vert.get_x() + x) / w * 2);
                spikes.push((vert.get_y() + y) / h * 2);
            });
        });

        this.buffers = {
            balls:  new Igloo.Buffer(gl),
            spikes: new Igloo.Buffer(gl, new Float32Array(spikes)),
            quad:   new Igloo.Buffer(gl, new Float32Array([
                    -1, -1, 1, -1, -1, 1, 1, 1
            ]))
        };

        this.fbo = gl.createFramebuffer();
        this.textures = {
            front: this.createTexture(),
            back:  this.createTexture()
        };
    } catch (e) {
        this.programs = null;
        this.ctx = canvas.getContext('2d');
        console.warn('Failed to init WebgL: ' + e);
    }
}

Bottle.WIDTH = 50;
Bottle.HEIGHT = 70;
Bottle.FPS = 60;
Bottle.BALL_COUNT = 150;
Bottle.BALL_RADIUS = 1;
Bottle.BALL_DENSITY = 1;
Bottle.BALL_FRICTION = 0;
Bottle.BALL_RESTITUTION = 0.3;
Bottle.GRAVITY = new B.Vec2(0, -20);
Bottle.NGRAVITY = new B.Vec2(0, -Bottle.GRAVITY.get_y());
Bottle.FLIP_RATE = 2.4;
Bottle.SPIKE_THICKNESS = 12;
Bottle.SPIKE_EXTENT = 20;

/**
 * @param {number} x A dimension
 * @returns {number} The smallest power of 2 >= x
 */
Bottle.highest2 = function(x) {
    return Math.pow(2, Math.ceil(Math.log(x) / Math.LN2));
};

Bottle.prototype.texScale = function() {
    return vec2(Bottle.highest2(this.gl.canvas.width),
                Bottle.highest2(this.gl.canvas.height));
};

/**
 * @returns {WebGLTexture} An appropriately initialized intermediate texture
 */
Bottle.prototype.createTexture = function() {
    var gl = this.gl, tex = gl.createTexture(),
        scale = this.texScale();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, scale.x, scale.y,
                  0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return tex;
};

/**
 * Swaps the front and back textures and bind the back texture.
 */
Bottle.prototype.swap = function() {
    var gl = this.gl,
        temp = this.textures.front;
    this.textures.front = this.textures.back;
    this.textures.back = temp;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.back);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                            gl.TEXTURE_2D, this.textures.back, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.front);
    return this;
};

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
    if (this.programs == null) {
        this.render2D();
    } else {
        this.renderGL();
    }
};

Bottle.prototype.renderGL = function() {
    var gl = this.gl;
    var w = this.gl.canvas.width, h = this.gl.canvas.height;
    var sx = w / this.width * 2, sy = h / this.height * 2;

    /* Update balls vertex attribute. */
    var pos = new Float32Array(this.balls.length * 2);
    for (var i = 0; i < this.balls.length; i++) {
        var p = this.balls[i].GetBody().GetPosition();
        pos[i * 2 + 0] = p.get_x() / w * sx;
        pos[i * 2 + 1] = p.get_y() / h * sy;
    }
    this.buffers.balls.update(pos);

    this.swap();
    gl.bindTexture(gl.TEXTURE_2D, this.textures.front);
    this.programs.balls.use()
        .attrib('ball', this.buffers.balls, 2)
        .uniform('size', Bottle.BALL_RADIUS * sx)
        .draw(gl.POINTS, this.balls.length);
    this.swap();

    if (this.doBlur) {
        this.programs.blur.use()
            .attrib('position', this.buffers.quad, 2)
            .uniform('base', 0, true)
            .uniform('scale', this.texScale())
            .uniform('dir', vec2(0.0, 1.0))
            .draw(gl.TRIANGLE_STRIP, 4);
        this.swap();

        this.programs.blur
            .uniform('dir', vec2(1.0, 0.0))
            .draw(gl.TRIANGLE_STRIP, 4);
        this.swap();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.programs.threshold.use()
        .attrib('position', this.buffers.quad, 2)
        .uniform('base', 0, true)
        .uniform('scale', this.texScale())
        .uniform('copy', !this.doThreshold, true)
        .uniform('threshold', this.threshold)
        .draw(gl.TRIANGLE_STRIP, 4);

    this.programs.spikes.use()
        .attrib('position', this.buffers.spikes, 2)
        .uniform('color', vec4(0.5, 0.5, 0.5, 1.0))
        .draw(gl.TRIANGLES, this.polys.length * 3);
};

Bottle.prototype.render2D = function() {
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
    this.time += 1 / Bottle.FPS;
    if (Math.sin(this.time / Bottle.FLIP_RATE * Math.PI) < 0) {
        this.world.SetGravity(Bottle.NGRAVITY);
    } else {
        this.world.SetGravity(Bottle.GRAVITY);
    }
    this.world.Step(1 / 30, 8, 3);
};
