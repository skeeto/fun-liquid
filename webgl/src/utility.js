var B = B || {};

B.Vec2         = Box2D.b2Vec2;
B.BodyDef      = Box2D.b2BodyDef;
B.Body         = Box2D.b2Body;
B.FixtureDef   = Box2D.b2FixtureDef;
B.Fixture      = Box2D.b2Fixture;
B.World        = Box2D.b2World;
B.MassData     = Box2D.b2MassData;
B.PolygonShape = Box2D.b2PolygonShape;
B.CircleShape  = Box2D.b2CircleShape;

B.b2_dynamicBody = Box2D.b2_dynamicBody;

function createPolygonShape(verts) {
    var shape = new Box2D.b2PolygonShape();
    var buffer = Box2D.allocate(verts.length * 8, 'float', Box2D.ALLOC_STACK);
    var offset = 0;
    for (var i = 0; i < verts.length; i++) {
        Box2D.setValue(buffer + (offset + 0), verts[i].get_x(), 'float'); // x
        Box2D.setValue(buffer + (offset + 4), verts[i].get_y(), 'float'); // y
        offset += 8;
    }
    var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
    shape.Set(ptr_wrapped, verts.length);
    return shape;
}

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
