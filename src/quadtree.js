(function(bioplot) {
    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    Rectangle.prototype = (function() {
        return {
            contains: function(that) {
                return (that.x >= this.x &&
                        that.y >= this.y &&
                        (that.x + that.width) <= (this.x + this.width) &&
                        (that.y + that.height) <= (this.y + this.height));
            },

            toString: function() {
                return "[x=" + this.x  + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + "]";
            },

            intersects: function(that) {
                return !(that.left > (this.left + this.width) ||
                        (that.left + that.width) < this.left ||
                        that.y > (this.y + this.height) ||
                        (that.y + that.height) < this.x);
            }
        };
    }());

    function Quadtree(boundary, level) {
        this.capacity = 10;
        this.level = level || 10;
        this.boundary = boundary;
        this.points = [];
    }

    bioplot.Rectangle = Rectangle;
    bioplot.Quadtree = Quadtree;
}(window.bioplot || (window.bioplot = {})));
