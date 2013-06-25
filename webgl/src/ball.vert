precision mediump float;

attribute vec2 ball;
uniform float size;

void main() {
    gl_Position = vec4(ball, 0., 1.);
    gl_PointSize = size;
}
