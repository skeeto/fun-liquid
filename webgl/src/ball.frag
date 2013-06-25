precision mediump float;

uniform vec4 color;

void main() {
    if (distance(vec2(0.0, 0.0), gl_PointCoord.xy - 0.5) < 0.5) {
        gl_FragColor = color;
    } else {
        gl_FragColor = vec4(1., 0., 1., 0.);
    }
}
