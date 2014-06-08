#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 ball;
uniform float size;

void main() {
    gl_Position = vec4(ball, 0.0, 1.0);
    gl_PointSize = size;
}
