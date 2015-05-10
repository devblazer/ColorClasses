/**
 * @module Color32
 * @requires module:Color24
 */
;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})

('Color32', function (Color24) {
    /**
     * Defines a 32bit color based on one of the following definitions:
     * hex string in format #?(rgb|rgba|rrggbb|rrggbbaa)
     * r, g, b
     * r, g, b, a
     * hexString, a
     *
     * @constructor
     * @alias module:Color32
     * @param {string|int} hexStringOrRedComponent - The 3,4,6 or 8 digit hex string, or the 0-255 red component
     * @param {float|int} [alphaOrGreenComponent] - The 0-255 green component or alpha value (0.0 - 1.0)
     * @param {int} [blueComponent] - The 0-255 blue component
     * @param {float} [alphaComponent] - The 0.0 - 1.0 alpha component
     */
    var _construct = function(hexStringOrRedComponent, alphaOrGreenComponent, blueComponent, alphaComponent) {
        var args = [];
        var color = ['r','g','b'];
        var _hexAlpha = null;
        var me = this;
        for (var p=0;p<arguments.length;p++)
            args.push(arguments[p]);
        var a = 1;
        if (args.length==2||args.length==4)
            a = args.pop();
        if (args.length==1&&this.validHexAlphaColor(args[0])) {
            var comp = this.hexAlpha2rgba(args[0]);
            a = comp.a;
            Color24.call(this,comp.r,comp.g,comp.r);
        }
        else
            Color24.apply(this,args);

        var parentCall = this.callInternal;
        var pfunctions = {};
        this.callInternal = function(name,args) {
            return pfunctions[name].apply(this,args);
        };

        /**
         * @property {int} r The red color component (0-255)
         * @property {int} g The green color component (0-255)
         * @property {int} b The blue color component (0-255)
         */
        for (var p in color) {
            (function(c){
                pfunctions['get'+ c.toUpperCase()] = function() {
                    return parentCall('get'+ c.toUpperCase(),[]);
                };
                pfunctions['set'+ c.toUpperCase()] = function(val) {
                    parentCall('set'+c.toUpperCase(),[val]);
                    _hexAlpha = null;
                };
                Object.defineProperty(me,c,{
                    configurable:true,
                    get:pfunctions['get'+ c.toUpperCase()],
                    set:pfunctions['set'+ c.toUpperCase()]
                });
            }(color[p]));
        }
        /**
         * @property {float} a The alpha component (0.0 - 1.0)
         */
        Object.defineProperty(this,'a',{
            configurable:true,
            get:function() {
                return a;
            },
            set:function(val) {
                if (!this.validAlphaComponent(val))
                    throw new Error( "Value of a is invalid: "+val);
                a = val;
            }
        });
        /**
         * @property {string} hex The 4-6 digit hex alpha color string
         */
        Object.defineProperty(this,'hexAlpha',{
            configurable:true,
            get:function() {
                if (!_hexAlpha)
                    _hexAlpha = this.rgba2hexAlpha(this.r,this.g,this.b,this.a);
                return _hexAlpha;
            },
            set:function(hexAlpha) {
                if (!this.validHexAlphaColor(hexAlpha))
                    throw new Error( "Hex-alpha color string is invalid: "+hexAlpha);
                _hexAlpha = hexAlpha;
                var color = this.hexAlpha2rgba(hexAlpha);
                this.r = color.r;
                this.g = color.g;
                this.b = color.b;
                a = color.a;
            }
        });
        this.a = a;
    };
    _construct.prototype = Object.create(Color24.prototype);

    /**
     * Checks if string is a valid hex alpha 4 or 8 digit color
     * @param {string} hex
     * @returns {boolean}
     */
    _construct.prototype.validHexAlphaColor = function(hex) {
        return typeof hex == 'string' && hex.match(/^#?([a-fA-F0-9]{4}){1,2}$/);
    };
    /**
     * Checks if color is an instance of Color32
     * @param col
     * @returns {boolean}
     */
    _construct.prototype.isColor32 = function(col) {
        return col instanceof _construct;
    };
    /**
     * Adds a new static readonly color constant (representing a 32bit color)
     * @param {string} name Name of the color
     * @param {Color32|Color24|string|int} colorOrRedComponent A Color32|Color24 instance or a hex string or (0-255)
     * @param {float|int} [alphaOrGreenComponent] - The 0-255 green component or alpha value (0.0 - 1.0)
     * @param {int} [blueComponent] - The 0-255 blue component
     * @param {float} [alphaComponent] - The 0.0 - 1.0 alpha component
     * @returns {void}
     */
    _construct.prototype.addColorDefinition = function (name, colorOrRedComponent, alphaOrGreenComponent, blueComponent, alphaComponent) {
        var args = [];
        for (var p=0;p<arguments.length;p++)
            args.push(arguments[p]);
        if (typeof name != 'string' || !name)
            throw new Error( "Invalid color name: "+name);
        if (_construct.prototype[name])
            throw new Error( "Color name already exists: "+name);
        var hex = arguments[1];
        if (this.isColor32(arguments[1]))
            hex = this.rgba2hexAlpha(arguments[1].r,arguments[1].g,arguments[1].b,arguments[1].a);
        else if (this.isColor24(arguments[1]))
            hex = arguments[1].hex;
        else {
            hex = Object.create(_construct.prototype);
            args.shift();
            _construct.apply(hex,args);
            hex = this.rgba2hexAlpha(hex.r,hex.g,hex.b,hex.a);
        }
        Object.defineProperty(_construct.prototype,name,{writable:false,value:hex});
    };
    /**
     * Checks if value is a valid number for an alpha component (0.0 - 1.0)
     * @param {float} val
     * @returns {boolean}
     */
    _construct.prototype.validAlphaComponent = function(val) {
        return !isNaN(val)&&val>=0&&val<=1;
    };
    /**
     * Converts r,g,b,a color components into a 8 digit hex alpha color string preceded by #
     * @param {int} r
     * @param {int} g
     * @param {int} b
     * @param {int} a
     * @returns {string}
     */
    _construct.prototype.rgba2hexAlpha = function(r,g,b,a) {
        if (!this.validColorComponent(r)||!this.validColorComponent(g)||!this.validColorComponent(b)||!this.validAlphaComponent(b))
            throw new Error( "Invalid color components: "+r+", "+g+", "+g+", "+a);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1) + Number(Math.round(a*255)).toString(16);
    };
    /**
     * Converts a 4 or 8 digit hex string into an r,g,b,a color components object
     * @param {string} hexAlpha
     * @returns {object}
     */
    _construct.prototype.hexAlpha2rgba = function(hexAlpha) {
        if (!this.validHexAlphaColor(hexAlpha))
            throw new Error( "Hex-alpha color string is invalid: "+hexAlpha);
        hexAlpha = hexAlpha.replace(/^#/,'');
        if (hexAlpha.length == 4)
            hexAlpha = hexAlpha.substr(0,1)+hexAlpha.substr(0,1)+hexAlpha.substr(1,1)+hexAlpha.substr(1,1)+hexAlpha.substr(2,1)+hexAlpha.substr(2,1)+hexAlpha.substr(3,1)+hexAlpha.substr(3,1);
        var bigint = parseInt(hexAlpha, 16);
        var r = (bigint >> 24) & 255;
        var g = (bigint >> 16) & 255;
        var b = (bigint >> 8) & 255;
        var a = (bigint & 255)/255;

        return {r:r,g:g,b:b,a:a};
    };
    /**
     * Takes one or more colors and overlays it into the current color based on alpha components and in order,
     * resulting in new r,g,b,a,etc. values (this).
     * You can pass it the same set of parameters you would to Color32 or Color24's constructers to
     * apply a single color, or you can add a combination of Color24, Color32 or hex strings
     *
     * @param {Color32|Color24|string|int} colorOrHexOrRedComponent
     * @param {Color32|Color24|string|float|int} [colorOrAlphaOrGreenComponent]
     * @param {Color32|Color24|string|int} [colorOrBlueComponent]
     * @param {Color32|Color24|string|float} [colorOrAlphaComponent]
     * @param {...Color32|Color24|string} [colorOrHex]
     * @returns {void}
     */
    _construct.prototype.merge = function(colorOrHexOrRedComponent, colorOrAlphaOrGreenComponent, colorOrBlueComponent, colorOrAlphaComponent) {
        var args = arguments;
        if (!this.isColor32(colorOrHexOrRedComponent) && !this.isColor24(colorOrHexOrRedComponent)) {
            var c = Object.create(Color32.prototype);
            Color32.apply(c,arguments);
            args = [c];
        }
        var r = this.r;
        var g = this.g;
        var b = this.b;
        var a = this.a;
        for (var p=0;p<args.length;p++) {
            var color = args[p];
            if (!this.isColor32(color)) {
                if (this.isColor24(color))
                    color.a = 1;
                else
                    color = new Color32(color);
            }
            r = (color.r*color.a) + (r*(1-color.a));
            g = (color.g*color.a) + (g*(1-color.a));
            b = (color.b*color.a) + (b*(1-color.a));
            a += (1-a) * color.a;
        }
        this.r = Math.round(r);
        this.g = Math.round(g);
        this.b = Math.round(b);
        this.a = a;
    };

    /**
     * @const {string} TRANSPARENT
     */
    _construct.prototype.addColorDefinition('TRANSPARENT','#0000');
    return _construct;
},['Color24']);