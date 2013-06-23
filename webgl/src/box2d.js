var B = B || {};

B.Vec2         = Box2D.Common.Math.b2Vec2;
B.BodyDef      = Box2D.Dynamics.b2BodyDef;
B.Body         = Box2D.Dynamics.b2Body;
B.FixtureDef   = Box2D.Dynamics.b2FixtureDef;
B.Fixture      = Box2D.Dynamics.b2Fixture;
B.World        = Box2D.Dynamics.b2World;
B.MassData     = Box2D.Collision.Shapes.b2MassData;
B.PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
B.CircleShape  = Box2D.Collision.Shapes.b2CircleShape;

B.CircleShape.prototype.render = function(ctx, pos) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.GetRadius(), 0, 2 * Math.PI);
    ctx.fill();
};

B.PolygonShape.prototype.render = function(ctx, pos) {
    ctx.beginPath();
    var verts = this.m_vertices;
    ctx.moveTo(verts[0].x + pos.x, verts[0].y + pos.y);
    for (var i = 1; i < verts.length; i++) {
        ctx.lineTo(verts[i].x + pos.x, verts[i].y + pos.y);
    }
    ctx.fill();
};

if (window.requestAnimationFrame == null) {
    window.requestAnimationFrame =
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function(f) {
            setTimeout(f, 16);
        };
}
