/**
 * @module Color24
 */
;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})

('Color24', function () {
    /**
     * Defines a 24bit color based on one of the following definitions:
     * hex string in format #?(rgb|rrggbb)
     * r, g, b
     *
     * @constructor
     * @alias module:Color24
     * @param {string|int} hexStringOrRedComponent - The 3 or 6 digit hex string, or the 0-255 red component
     * @param {int} [greenComponent] - The 0-255 green component
     * @param {int} [blueComponent] - The 0-255 blue component
     */
    var _construct = function(hexStringOrRedComponent,greenComponent,blueComponent) {
        var color = {r:0,g:0,b:0};
        var me = this;

        /**
         * @property {int} r The red color component (0-255)
         * @property {int} g The green color component (0-255)
         * @property {int} b The blue color component (0-255)
         */
        for (var p in color) {
            (function(c){
                Object.defineProperty(me,c,{
                    get:function() {
                        return color[c];
                    },
                    set:function(val) {
                        if (!me.validColorComponent(val))
                            throw new Error("Value of "+c+" is invalid: "+val);
                        color[c] = val;
                        color.hex = null;
                    }
                });
            }(p));
        }
        /**
         * @property {string} hex The 3-6 digit hex color string
         */
        color.hex = null;
        Object.defineProperty(this,'hex',{
            get:function() {
                if (color.hex === null)
                    color.hex = me.rgb2hex(color.r,color.g,color.b);
                return color.hex;
            },
            set:function(hex) {
                if (!me.validHexColor(hex))
                    throw new Error( "Hex color string is invalid: "+hex);
                color = me.hex2rgb(hex);
                color.hex = hex;
            }
        });

        if (arguments.length == 1)
            this.hex = hexStringOrRedComponent;
        else {
            this.r = hexStringOrRedComponent;
            this.g = greenComponent;
            this.b = blueComponent;
        }
    };
    /**
     * Checks if color is an instance of Color24
     * @param col
     * @returns {boolean}
     */
    _construct.prototype.isColor24 = function(col) {
        return col instanceof _construct;
    };
    /**
     * Adds a new static readonly color constant
     * @param {string} name Name of the color
     * @param {Color24|string|int} colorOrRedComponent A Color24 instance or a hex string or (0-255)
     * @param {int} [greenComponent] The green color component (0-255)
     * @param {int} [blueComponent] The blue color component (0-255)
     * @returns {void}
     */
    _construct.prototype.addColorDefinition = function (name,colorOrRedComponent,greenComponent,blueComponent) {
        if (typeof name != 'string' || !name)
            throw new Error( "Invalid color name: "+name);
        if (_construct.prototype[name])
            throw new Error( "Color name alreaday exists: "+name);
        var hex = colorOrRedComponent;
        if (arguments.length == 4)
            hex = this.rgb2hex(colorOrRedComponent,greenComponent,blueComponent);
        Object.defineProperty(_construct.prototype,name,{writable:false,value:hex});
    };
    /**
     * Checks if string is a valid hex 3 or 6 digit color
     * @param {string} hex
     * @returns {boolean}
     */
    _construct.prototype.validHexColor = function(hex) {
        return typeof hex == 'string' && hex.match(/^#?([a-fA-F0-9]{3}){1,2}$/);
    };
    /**
     * Checks if int is a valid number for a color component (0-255)
     * @param {int} col
     * @returns {boolean}
     */
    _construct.prototype.validColorComponent = function(col) {
        return !isNaN(col)&&col>=0&&col<=255&&col%1==0;
    };
    /**
     * Converts r,g,b color components into a 6 digit hex color string preceded by #
     * @param {int} r
     * @param {int} g
     * @param {int} b
     * @returns {string}
     */
    _construct.prototype.rgb2hex = function(r,g,b) {
        if (!this.validColorComponent(r)||!this.validColorComponent(g)||!this.validColorComponent(b))
            throw new Error( "Invalid color components: "+r+", "+g+", "+g);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    };
    /**
     * Converts a 3 or 6 digit hex string into an r,g,b color components object
     * @param {string} hex
     * @returns {object}
     */
    _construct.prototype.hex2rgb = function(hex) {
        if (!this.validHexColor(hex))
            throw new Error( "Hex color string is invalid: "+hex);
        hex = hex.replace(/^#/,'');
        if (hex.length == 3)
            hex = hex.substr(0,1)+hex.substr(0,1)+hex.substr(1,1)+hex.substr(1,1)+hex.substr(2,1)+hex.substr(2,1);
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return {r:r,g:g,b:b};
    };
    /**
     * Takes one or more colors and merges it into the current color (this), resulting in new r,g,b,etc. values
     * You can pass it a set r, g, b parameters for a single color mix,
     * or you can pass it one or more combintation of Color24 instances and hex strings
     *
     * @param {Color24|string|int} colorOrHexOrRedComponent
     * @param {Color24|string|int} [colorOrGreenComponent]
     * @param {Color24|string|int} [colorOrBlueComponent]
     * @param {...Color24|string} [colorOrHex]
     * @returns {void}
     */
    _construct.prototype.merge = function(colorOrHexOrRedComponent, colorOrGreenComponent, colorOrBlueComponent) {
        if (arguments.length==3 && this.validColorComponent(colorOrHexOrRedComponent) && this.validColorComponent(colorOrGreenComponent) && this.validColorComponent(arguments[2])) {
            this.r = Math.round((this.r + colorOrHexOrRedComponent)/2);
            this.g = Math.round((this.g + colorOrGreenComponent)/2);
            this.b = Math.round((this.b + colorOrBlueComponent)/2);
        }
        else {
            var r = this.r;
            var g = this.g;
            var b = this.b;
            for (var p=0;p<arguments.length;p++) {
                if (!this.isColor24(arguments[p]))
                    arguments[p] = new Color24(arguments[p]);
                r += arguments[p].r;
                g += arguments[p].g;
                b += arguments[p].b;
            }
            this.r = Math.round(r / (arguments.length+1));
            this.g = Math.round(g / (arguments.length+1));
            this.b = Math.round(b / (arguments.length+1));
        }
    };

    /**
     * @const {string} RED
     * @const {string} GREEN
     * @const {string} BLUE
     * @const {string} BLACK
     * @const {string} WHITE
     */
    _construct.prototype.addColorDefinition('RED','#f00');
    _construct.prototype.addColorDefinition('GREEN','#0f0');
    _construct.prototype.addColorDefinition('BLUE','#00f');
    _construct.prototype.addColorDefinition('BLACK','#000');
    _construct.prototype.addColorDefinition('WHITE','#fff');
    return _construct;
},[]);