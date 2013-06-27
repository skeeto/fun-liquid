function FPS() {
    this.second = null;
    this.counter = 0;
    this.value = NaN;
    this.listeners = [];
}

FPS.prototype.tick = function() {
    var now = ~~(Date.now() / 1000);
    if (this.second != now) {
        this.value = this.count;
        this.second = now;
        this.count = 0;
        var value = this.value;
        this.listeners.forEach(function(callback) {
            callback(value);
        });
    } else {
        this.count++;
    }
};

FPS.prototype.listen = function(callback) {
    this.listeners.push(callback);
};

FPS.prototype.valueOf = function() {
    return this.value;
};

FPS.prototype.toString = function() {
    return '[FPS ' + this.value + ']';
};
