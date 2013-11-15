function rectangle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.contains = function(that) {
        if (that.dataType === "line") return this._containsLine(that);
        if (that.dataType === "point") return this._containsPoint(that);

        return (that.x >= this.x &&
                that.y >= this.y &&
                (that.x + that.width) <= (this.x + this.width) &&
                (that.y + that.height) <= (this.y + this.height));
    };

    this._containsLine = function(line) {
        return (this._containsPoint({ x: line.x1, y: line.y1})
                && this._containsPoint({ x: line.x2, y: line.y2}));
    };

    this._containsPoint = function(point) {
        return (point.x >= this.x &&
                point.y >= this.y &&
                point.x <= (this.x + this.width) &&
                point.y <= (this.y + this.height));
    };

    this.toString = function() {
        return "[x=" + this.x  + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + "]";
    };

    this.intersects = function(that) {
        if (that.dataType === "line") return this._intersectsLine(that);
        if (that.dataType === "point") return this._containsPoint(that);

        return !(that.left > (this.left + this.width) ||
                 (that.left + that.width) < this.left ||
                 that.y > (this.y + this.height) ||
                 (that.y + that.height) < this.x);
    };

    this._intersectsLine = function(line) {
        return (this._containsPoint({ x: line.x1, y: line.y1})
                || this._containsPoint({ x: line.x2, y: line.y2}));
    };
}

function quadtree(boundary, level) {
    this.capacity = 10;
    this.level = level || 10;
    this.boundary = boundary;
    this.points = [];

    this._split = function() {
        var width = parseInt(this.boundary.width / 2),
            height = parseInt(this.boundary.height / 2),
            l = this.level + 1,
            x = this.boundary.x,
            y = this.boundary.y,
            x2 = x + width,
            y2 = y + height;

        this.northWest = new quadtree(new rectangle(x, y2, width, height), l);
        this.northEast = new quadtree(new rectangle(x2, y2, width, height), l);
        this.southEast = new quadtree(new rectangle(x2, y, width, height), l);
        this.southWest = new quadtree(new rectangle(x, y, width, height), l);
    };

    this.clear = function() {
        if (this.northWest !== undefined) this.northWest.clear();
        if (this.northEast !== undefined) this.northEast.clear();
        if (this.southWest !== undefined) this.southWest.clear();
        if (this.southEast !== undefined) this.southEast.clear();

        this.northWest = undefined;
        this.northEast = undefined;
        this.southWest = undefined;
        this.southEast = undefined;
        this.points.length = 0;
    };

    this.insert = function(data) {
        if (!this.boundary.contains(data)) return false;

        if (this.points.length < this.capacity) {
            this.points.push(data);
            return true;
        }

        if (this.northWest === undefined) {
            this._split();
        }

        if (this.northWest.insert(data)) return true;
        if (this.northEast.insert(data)) return true;
        if (this.southWest.insert(data)) return true;
        if (this.southEast.insert(data)) return true;

        this.points.push(data);

        return true;
    };

    this.query = function(boundingBox) {
        var points = [];
        if (!this.boundary.intersects(boundingBox)) return points;

        this.points.forEach(function(point) {
            if (boundingBox.intersects(point)) points.push(point);
        });

        if (this.northWest === undefined) return points;

        points = points.concat(this.northWest.query(boundingBox));
        points = points.concat(this.northEast.query(boundingBox));
        points = points.concat(this.southWest.query(boundingBox));
        points = points.concat(this.southEast.query(boundingBox));

        return points;
    };
}
