#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D base;
uniform vec2 scale;
uniform vec2 dir;

void main() {
    vec2 p = gl_FragCoord.xy / scale;
    gl_FragColor =
        texture2D(base, p + dir * vec2(-4.0, -4.0) / scale) * 0.06297 +
        texture2D(base, p + dir * vec2(-2.0, -2.0) / scale) * 0.092902 +
        texture2D(base, p + dir * vec2(-3.0, -3.0) / scale) * 0.12265 +
        texture2D(base, p + dir * vec2(-1.0, -1.0) / scale) * 0.14489 +
        texture2D(base, p + dir * vec2( 0.0,  0.0) / scale) * 0.15317 +
        texture2D(base, p + dir * vec2( 1.0,  1.0) / scale) * 0.14489 +
        texture2D(base, p + dir * vec2( 2.0,  2.0) / scale) * 0.12265 +
        texture2D(base, p + dir * vec2( 3.0,  3.0) / scale) * 0.092902 +
        texture2D(base, p + dir * vec2( 4.0,  4.0) / scale) * 0.06297;
}
