precision mediump float;

varying vec2 coord;

uniform sampler2D base;
uniform vec2 scale;

void main() {
    gl_FragColor = texture2D(base, (coord + 1.) / scale);
}
