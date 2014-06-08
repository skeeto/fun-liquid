#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D base;
uniform vec2 scale;
uniform float threshold;

void main() {
    float value = texture2D(base, gl_FragCoord.xy / scale).r;
    if (value > threshold) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
