#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D base;
uniform vec2 scale;
uniform vec2 dir;

void main() {
    vec2 p = gl_FragCoord.xy / scale;
    gl_FragColor =
        texture2D(base, p + dir * vec2(-9.0, -9.0) / scale) * 0.02433 +
        texture2D(base, p + dir * vec2(-8.0, -8.0) / scale) * 0.03081 +
        texture2D(base, p + dir * vec2(-7.0, -7.0) / scale) * 0.03795 +
        texture2D(base, p + dir * vec2(-6.0, -6.0) / scale) * 0.04546 +
        texture2D(base, p + dir * vec2(-5.0, -5.0) / scale) * 0.05297 +
        texture2D(base, p + dir * vec2(-4.0, -4.0) / scale) * 0.06002 +
        texture2D(base, p + dir * vec2(-3.0, -3.0) / scale) * 0.06615 +
        texture2D(base, p + dir * vec2(-2.0, -2.0) / scale) * 0.07090 +
        texture2D(base, p + dir * vec2(-1.0, -1.0) / scale) * 0.07392 +
        texture2D(base, p + dir * vec2( 0.0,  0.0) / scale) * 0.07495 +
        texture2D(base, p + dir * vec2( 1.0,  1.0) / scale) * 0.07392 +
        texture2D(base, p + dir * vec2( 2.0,  2.0) / scale) * 0.07090 +
        texture2D(base, p + dir * vec2( 3.0,  3.0) / scale) * 0.06615 +
        texture2D(base, p + dir * vec2( 4.0,  4.0) / scale) * 0.06002 +
        texture2D(base, p + dir * vec2( 5.0,  5.0) / scale) * 0.05297 +
        texture2D(base, p + dir * vec2( 6.0,  6.0) / scale) * 0.04546 +
        texture2D(base, p + dir * vec2( 7.0,  7.0) / scale) * 0.03795 +
        texture2D(base, p + dir * vec2( 8.0,  8.0) / scale) * 0.03081 +
        texture2D(base, p + dir * vec2( 9.0,  9.0) / scale) * 0.02433;
}
