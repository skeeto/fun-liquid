/**
 * JavaScript fast vector implementations via metaprogramming.
 */

var VecN = VecN || function() {};

VecN.FIELDS = 'xyzwabcdefghijklmnopqrstuv'.split('');

VecN.make = function(n) {
    if (n > VecN.FIELDS.length) {
        throw new Error('VecN limited to ' + VecN.FIELDS.length);
    }

    function func(params, body) {
        var args = params.slice(0);
        args.push(body);
        args.unshift(null);
        var factory = Function.bind.apply(Function, args);
        return new factory();
    }

    var fields = VecN.FIELDS.slice(0, n);

    /**
     * @constructor
     */
    var Vec = func(fields, fields.map(function(field) {
        return 'this.' + field + ' = ' + field + ';';
    }).join('\n'));

    Vec.prototype = Object.create(VecN.prototype);
    Vec.prototype.length = n;
    Vec.prototype.VecN = this;

    Vec.prototype.toString
        = func([], 'return "[Vec' + n + ' (" + ' +
               fields.map(function(field) {
                   return 'this.' + field;
               }).join(' + ", " + ') + ' + ")]";');

    function create(f, constructor) {
        constructor = constructor || 'this.constructor';
        return 'return new ' + constructor +
            '(' + fields.map(f).join(', ') + ');';
    }

    function opWith(operator) {
        return func(['vec'], create(function(field) {
            return 'this.' + field + ' ' + operator + ' vec.' + field;
        }));
    }

    /**
     * @method
     */
    Vec.prototype.add = opWith('+');

    /**
     * @method
     */
    Vec.prototype.subtract = opWith('-');

    /**
     * @method
     */
    Vec.prototype.multiply = opWith('*');

    /**
     * @method
     */
    Vec.prototype.divide = opWith('/');

    function op(operator) {
        return func(['scalar'], create(function(field) {
            return 'this.' + field + ' ' + operator + ' scalar';
        }));
    }

    /**
     * @method
     */
    Vec.prototype.fadd = op('+');

    /**
     * @method
     */
    Vec.prototype.fsubtract = op('-');

    /**
     * @method
     */
    Vec.prototype.fmultiply = op('*');

    /**
     * @method
     */
    Vec.prototype.fdivide = op('/');

    /**
     * @method
     */
    Vec.prototype.magnitude =
        func([], 'return Math.sqrt(' + fields.map(function(f) {
            return 'this.' + f + ' * this.' + f;
        }).join(' + ') + ');');

    function apply(name, params) {
        params = params || [];
        return func(params, create(function(f) {
            var args = params.slice(0);
            args.unshift('this.' + f);
            return name + '(' + args.join(', ') + ')';
        }));
    };

    /**
     * @method
     */
    Vec.prototype.floor = apply('Math.floor');

    /**
     * @method
     */
    Vec.prototype.ceil = apply('Math.ceil');

    /**
     * @method
     */
    Vec.prototype.abs = apply('Math.abs');

    /**
     * @method
     */
    Vec.prototype.negate = apply('-1 * ');

    /**
     * @method
     */
    Vec.prototype.pow = apply('Math.pow', ['expt']);

    /**
     * @method
     */
    Vec.prototype.pow2 = func([], create(function(f) {
        return 'this.' + f + ' * this.' + f;
    }));

    /**
     * @method
     */
    Vec.prototype.pow3 = func([], create(function(f) {
        return 'this.' + f + ' * this.' + f + ' * this.' + f;
    }));

    /**
     * @method
     */
    Vec.prototype.product = func([], 'return ' + fields.map(function(f) {
        return 'this.' + f;
    }).join(' * ') + ';');


    /**
     * @method
     */
    Vec.prototype.sum = func([], 'return ' + fields.map(function(f) {
        return 'this.' + f;
    }).join(' + ') + ';');

    /**
     * @method
     */
    Vec.prototype.normalize = function normalize() {
        return this.divide(this.magnitude());
    };

    /**
     * @method
     */
    Vec.prototype.dot = function dot(vec) {
        return this.multiply(vec).sum();
    };

    /**
     * @method
     */
    Vec.prototype.toArray = func([], 'return [' + fields.map(function(field) {
            return 'this.' + field;
        }).join(', ') + ']');

    /* Setup swizzling. */

    function swizzle(fields) {
        var args = fields.map(function(field) {
            return 'this.' + field;
        }).join(', ');
        Object.defineProperty(Vec.prototype, fields.join(''), {
            get: new Function('return new this.VecN.Vec' + fields.length +
                              '(' + args + ');')
        });
    }

    function swizzleRec(stack, count) {
        fields.forEach(function(field) {
            stack.push(field);
            if (count === 1) {
                swizzle(stack);
            } else {
                swizzleRec(stack, count - 1);
            }
            stack.pop();
        });
    }

    if (n <= 6) { // stop at 7,776
        for (var i = 2; i <= n; i++) {
            swizzleRec([], i);
        }
    }

    Vec.random = func([], create(function() {
        return 'Math.random()';
    }, 'this'));

    return Vec;
};
(10);

/**
 * Create a convenience constructor function.
 * @param {Number} n
 * @returns {Function}
 */
VecN.convenience = function(n) {
    return function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (arg.toArray) {
                args.push.apply(args, arg.toArray());
            } else {
                args.push(arg);
            }
        }
        var Vec = VecN['Vec' + n];
        var vec = Object.create(Vec.prototype);
        Vec.apply(vec, args);
        return vec;
    };
};

/* Now create vectors of lengths 2, 3, and 4. */
VecN.Vec2 = VecN.make(2);
VecN.Vec3 = VecN.make(3);
VecN.Vec4 = VecN.make(4);
var vec2 = VecN.convenience(2);
var vec3 = VecN.convenience(3);
var vec4 = VecN.convenience(4);
/**
 * Fluent WebGLProgram wrapper for managing variables and data. The
 * constructor compiles and links a program from a pair of shaders.
 * Throws an exception if compiling or linking fails.
 * @param {WebGLRenderingContext|HTMLCanvasElement} gl
 * @param {string} vertUrl
 * @param {string} vergrafUrl
 * @returns {WebGLProgram}
 */
function IglooProgram(gl, vertUrl, fragUrl) {
    if  (gl instanceof HTMLCanvasElement) {
        gl = IglooProgram.getContext(gl);
        if (gl == null) throw new Error('Could not create WebGL context.');
    }
    this.gl = gl;
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.makeShader(gl.VERTEX_SHADER, vertUrl));
    gl.attachShader(this.program, this.makeShader(gl.FRAGMENT_SHADER, fragUrl));
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(this.program));
    }
    this.vars = {};
}

/**
 * Asynchronously or synchronously fetch data from the server.
 * @param {string} url
 * @param {Function} [callback]
 * @returns {string}
 */
IglooProgram.fetch = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, Boolean(callback));
    if (callback != null) {
        xhr.onload = function() {
            callback(xhr.responseText);
        };
    }
    xhr.send();
    return xhr.responseText;
};

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {?WebGLRenderingContext} a WebGL rendering context.
 */
IglooProgram.getContext = function(canvas) {
    var gl;
    try {
        gl = canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl');
    } catch (e) {
        gl = null;
    }
    return gl;
};

/**
 * Compile a shader from a URL.
 * @param {number} type
 * @param {string} url
 * @returns {WebGLShader}
 */
IglooProgram.prototype.makeShader = function(type, url) {
    var gl = this.gl;
    var shader = gl.createShader(type);
    gl.shaderSource(shader, IglooProgram.fetch(url));
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    } else {
        throw new Error(gl.getShaderInfoLog(shader));
    }
};

/**
 * Tell WebGL to use this program right now.
 * @returns {IglooProgram} this
 */
IglooProgram.prototype.use = function() {
    this.gl.useProgram(this.program);
    return this;
};

/**
 * Declare a uniform or set a uniform's data.
 * @param {string} name uniform variable name
 * @param {number|Point} [value]
 * @returns {IglooProgram} this
 */
IglooProgram.prototype.uniform = function(name, value) {
    if (value == null) {
        this.vars[name] = this.gl.getUniformLocation(this.program, name);
    } else {
        if (this.vars[name] == null) this.uniform(name);
        var v = this.vars[name];
        if (value instanceof VecN) {
            switch (value.length) {
            case 2:
                this.gl.uniform2f(v, value.x, value.y);
                break;
            case 3:
                this.gl.uniform3f(v, value.x, value.y, value.z);
                break;
            case 4:
                this.gl.uniform4f(v, value.x, value.y, value.z, value.w);
                break;
            default:
                throw new Error('Invalid vector length');
            }
        } else {
            this.gl.uniform1f(v, value);
        }
    }
    return this;
};

/**
 * Declare an attrib or set an attrib's buffer.
 * @param {string} name attrib variable name
 * @param {WebGLBuffer} [value]
 * @param {number} [size] element size
 * @returns {IglooProgram} this
 */
IglooProgram.prototype.attrib = function(name, value, size) {
    if (value == null) {
        this.vars[name] = this.gl.getAttribLocation(this.program, name);
        this.gl.enableVertexAttribArray(this.vars.position);
    } else {
        if (this.vars[name] == null) this.attrib(name);
        var gl = this.gl;
        if (value instanceof IglooBuffer) {
            value.bind();
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, value);
        }
        gl.vertexAttribPointer(this.vars[name], size, gl.FLOAT, false, 0, 0);
    }
    return this;
};

/**
 * Call drawArrays with this program. You must call this.use() first.
 * @param {number} mode
 * @param {number} count the total buffer length
 * @returns {IglooProgram} this
 */
IglooProgram.prototype.draw = function(mode, count) {
    this.gl.drawArrays(mode, 0, count);
    if (this.gl.getError() !== this.gl.NO_ERROR) {
        throw new Error('WebGL rendering error');
    }
    return this;
};
/**
 * Fluent WebGLBuffer wrapper.
 * @param {WebGLRenderingContext|HTMLCanvasElement} gl
 * @param {ArrayBuffer|ArrayBufferView} [data]
 * @param {GLenum} [usage]
 * @returns {WebGLProgram}
 */

function IglooBuffer(gl, data, usage) {
    if  (gl instanceof HTMLCanvasElement) {
        gl = IglooProgram.getContext(gl);
        if (gl == null) throw new Error('Could not create WebGL context.');
    }
    this.gl = gl;
    this.buffer = gl.createBuffer();
    this.size = -1;
    if (data != null) {
        this.update(data, usage);
    }
}

/**
 * Binds this buffer to ARRAY_BUFFER.
 * @returns {IglooBuffer} this
 */
IglooBuffer.prototype.bind = function() {
    var gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    return this;
};

/**
 * @param
 * @param {ArrayBuffer|ArrayBufferView} data
 * @param {GLenum} [usage]
 * @returns {IglooBuffer} this
 */
IglooBuffer.prototype.update = function(data, usage) {
    var gl = this.gl;
    usage = usage == null ? gl.STREAM_DRAW : usage;
    this.bind();
    if (this.size !== data.byteLength) {
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        this.size = data.byteLength;
    } else {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
    }
    return this;
};
