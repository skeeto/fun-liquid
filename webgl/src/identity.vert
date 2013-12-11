precision mediump float;

attribute vec2 position;

uniform float baseSize;
uniform vec2 canvasSize;

varying vec2 coord;

void main() {
    vec2 scale = baseSize * 2. / canvasSize;
    coord = (position + 1.) / scale;
    gl_Position = vec4(position, 0., 1.);
}
