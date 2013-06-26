attribute vec2 position;

varying vec2 coord;

void main() {
    coord = position;
    gl_Position = vec4(position, 0., 1.);
}
