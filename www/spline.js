

function Waypoint(robot) {
	Object.defineProperty(this, "x", { enumerable: true, get: function () { return robot.x; } });
	Object.defineProperty(this, "y", { enumerable: true, get: function () { return robot.y; } });
	Object.defineProperty(this, "theta", { enumerable: true, get: function () { return robot.rot; } });
}

function Coord(x, y) {
	this.x = x;
	this.y = y;
}

function Spline(a, b) {
	this.startTheta = function () {
		return a.theta;
	}
	this.endTheta = function () {
		return b.theta;
	}
	Object.defineProperty(this, "xOff", { enumerable: true, get: function () { return a.x; } });
	Object.defineProperty(this, "yOff", { enumerable: true, get: function () { return a.y; } });

	Object.defineProperty(this, "knot", { enumerable: true, get: function () { return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)); } });
	Object.defineProperty(this, "angleOff", { enumerable: true, get: function () { return Math.atan2(b.y - a.y, b.x - a.x); } });
	function getA0() {
		var a0 = -a.theta - this.angleOff;
		while (a0 > 2 * Math.PI) {
			a0 -= Math.PI * 2;
		}
		a0 = Math.tan(a0);
		return a0;
	}
	function getA1() {
		var a1 = -b.theta - this.angleOff;
		while (a1 > 2 * Math.PI) {
			a1 -= Math.PI * 2;
		}
		return a1;
	}

	a1 = Math.tan(a1);
	Object.defineProperty(this, "a", { enumerable: true, get: function () { return 0 } });
	Object.defineProperty(this, "b", { enumerable: true, get: function () { return 0 } });
	Object.defineProperty(this, "c", { enumerable: true, get: function () { return (getA0() + getA1()) / (this.knot * this.knot) } });
	Object.defineProperty(this, "d", { enumerable: true, get: function () { return -(2 * getA0() + getA1()) / this.knot; } });
	Object.defineProperty(this, "e", { enumerable: true, get: function () { return getA0(); } });
	this.coord = function (percentage) {
		percentage = Math.max(Math.min(percentage, 1), 0);
		var x = percentage * this.knot;
		var y = (this.a * x + this.b) * (Math.pow(x, 4)) + (this.c * x + this.d) * (x * x) + this.e * x;
		var theta = Math.atan2(y, x);
		var cosTheta = Math.cos(this.angleOff);
		var sinTheta = Math.sin(this.angleOff);

		return new Coord(x * cosTheta - y * sinTheta + this.xOff, x * sinTheta + y * cosTheta + this.yOff)
	}
}