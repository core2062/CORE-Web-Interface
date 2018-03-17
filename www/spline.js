

function Waypoint(robot) {
	Object.defineProperty(this, "x", { enumerable: true, get: function () { return robot.x; } });
	Object.defineProperty(this, "y", { enumerable: true, get: function () { return robot.y; } });
	Object.defineProperty(this, "theta", { enumerable: true, get: function () { return robot.rot; } });
}

function Coord(x, y) {
	this.x = x;
	this.y = y;
}

function Spline(w1, w2) {
	this.startTheta = function () {
		return w1.theta;
	}
	this.endTheta = function () {
		return w2.theta;
	}
	Object.defineProperty(this, "xOff", { enumerable: true, get: function () { return w1.x; } });
	Object.defineProperty(this, "yOff", { enumerable: true, get: function () { return w1.y; } });

	Object.defineProperty(this, "knot", { enumerable: true, get: function () { return Math.sqrt((w2.x - w1.x) * (w2.x - w1.x) + (w2.y - w1.y) * (w2.y - w1.y)); } });
	Object.defineProperty(this, "angleOff", { enumerable: true, get: function () { return Math.atan2(w2.y - w1.y, w2.x - w1.x); } });
	function getA0() {
		var a0 = -w1.theta - this.angleOff;
		while (a0 > 2 * Math.PI) {
			a0 -= Math.PI * 2;
		}
		a0 = Math.tan(a0);
		return a0;
	}
	function getA1() {
		var a1 = -w2.theta - this.angleOff;
		while (a1 > 2 * Math.PI) {
			a1 -= Math.PI * 2;
		}
		a1 = Math.tan(a1);
		return a1;
	}
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