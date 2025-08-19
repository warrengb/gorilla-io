"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Display = void 0;
var Display = /** @class */ (function () {
    function Display(name, resolution) {
        if (resolution === void 0) { resolution = 1; }
        this._id = 0;
        this._resolution = 1;
        this.border = false;
        this._id = ++Display.id_generator;
        this._name = name.toLowerCase();
        this._canvas = document.getElementById(this._name);
        this.resize();
        this._buffer = document.createElement('canvas');
        this._context = this.buffer.getContext("2d");
        this._canvas_context = this.canvas.getContext("2d");
        Display._displays.push(this);
        this.resolution = resolution;
    }
    Object.defineProperty(Display.prototype, "id", {
        get: function () { return this._id; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "cursor", {
        get: function () { return this.canvas.style.cursor; },
        set: function (name) { this.canvas.style.cursor = name; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display, "displays", {
        get: function () { return Display._displays; },
        enumerable: false,
        configurable: true
    });
    Display.find = function (name) {
        name = name.toLowerCase();
        if (Display._displays.length)
            for (var _i = 0, _a = Display._displays; _i < _a.length; _i++) {
                var display = _a[_i];
                if (name == display.name)
                    return display;
            }
        return null;
    };
    Display.destroy = function (name) {
        var display = Display.find(name);
        if (display)
            display.remove();
    };
    Display.prototype.remove = function () {
        for (var i = 0; i < Display._displays.length; i++) {
            if (Display._displays[i].name == this.name) {
                Display._displays.splice(i, 1);
                break;
            }
        }
    };
    Display.available = function (name) {
        var canvas = document.getElementById(name.toLowerCase());
        return canvas != null;
    };
    Display.get = function (name, resolution) {
        if (resolution === void 0) { resolution = 0; }
        var display = Display.find(name);
        if (!display) {
            return new Display(name, (resolution > 0) ? resolution : 1);
        }
        if (resolution > 0)
            display.resolution = resolution;
        return display;
    };
    Object.defineProperty(Display.prototype, "name", {
        get: function () { return this._name; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "canvas", {
        get: function () { return this._canvas; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "buffer", {
        get: function () { return this._buffer; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "context", {
        get: function () { return this._context; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "resolution", {
        get: function () { return this._resolution; },
        set: function (value) {
            this._resolution = value;
            this._canvas.width = this.width * this._resolution;
            this._canvas.height = this.height * this._resolution;
            this._canvasHalfWidth = this._canvas.width / 2;
            this._canvasHalfHeight = this._canvas.height / 2;
            this._buffer.width = this._canvas.width;
            this._buffer.height = this._canvas.height;
            this._rect = this.canvas.getBoundingClientRect();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "x", {
        get: function () { return this._rect.left; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "y", {
        get: function () { return this._rect.top; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "halfWidth", {
        get: function () { return this._halfWidth; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "halfHeight", {
        get: function () { return this._halfHeight; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "canvasHalfWidth", {
        get: function () { return this._canvasHalfWidth; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "canvasHalfHeight", {
        get: function () { return this._canvasHalfHeight; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "left", {
        get: function () { return this._rect.left; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "top", {
        get: function () { return this._rect.top; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "right", {
        get: function () { return this._rect.right; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "bottom", {
        get: function () { return this._rect.bottom; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "width", {
        get: function () { return this._width; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Display.prototype, "height", {
        get: function () { return this._height; },
        enumerable: false,
        configurable: true
    });
    Display.prototype.update = function () {
        this._rect = this.canvas.getBoundingClientRect();
        //this.context.clearRect(-this.canvasHalfWidth, -this.canvasHalfHeight, this.canvas.width + this.canvasHalfWidth, this.canvas.height + this.canvasHalfHeight);
    };
    Display.prototype.swap = function () {
        //    this._canvas_context.clearRect(-this.canvasHalfWidth, -this.canvasHalfHeight, this.canvas.width + this.canvasHalfWidth, this.canvas.height + this.canvasHalfHeight);
        this._canvas_context.drawImage(this._buffer, 0, 0);
    };
    Display.prototype.resize = function () {
        this._width = this._canvas.width;
        this._height = this._canvas.height;
        this._halfWidth = this.width / 2;
        this._halfHeight = this.height / 2;
    };
    Display.id_generator = 0;
    Display._displays = [];
    return Display;
}());
exports.Display = Display;
//# sourceMappingURL=display.js.map