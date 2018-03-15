var field = new Image();
var robot = new Image();

var rotTarget = -1;
var moveTarget = -1;

var autonCreatorFirstRun = true;

//properties
var fieldWidthIn = 324;
var fieldHeightIn = 652;
var robotWidthIn = 39.5;
var robotHeightIn = 35.5;
var robotCenterIn = 19;

var splines = [];
var samples = 5;

var toolBarWidth = 100;
var fieldWidthPxl = 0;

function Robot(x, y, rot){
	this.x = x;
	this.y = y;
	this.rot = rot;
}

var robots = [];
var oldRobots = [];
var waypoints = [];

function getTargetRobot() {
	var r = 20;
	var ratio = (fieldWidthPxl) / fieldWidthIn;
	var mX = fieldMousePos.x / ratio;
	var mY = fieldMousePos.y / ratio;
    var closestRobot = -1;
    var currentLeastDistance = r;
    for(var i in robots){
        var distance = hypot(mX, mY, robots[i].y, robots[i].x);
        if(distance < currentLeastDistance) {
            closestRobot = i;
            currentLeastDistance = distance;
        }
    }
    return closestRobot;
}

function autonCreatorInit(){
    splines = [];
    field.src = "images/field.png";
    robot.src = "images/robot.png";
    robots.push(new Robot(75, 324/2, 0));
    robots.push(new Robot(45, 220, 45*(Math.PI/180)));
    robots.push(new Robot(75, 290, 90*(Math.PI/180)));
}

function autonCreatorLoop(){
    fieldWidthPxl = windowWidth - toolBarWidth
    fieldContext.canvas.width = fieldWidthPxl;
    fieldContext.canvas.height = windowHeight - 32;

    creatorToolbar.style.width = String(toolBarWidth) + "px";
    creatorToolbar.style.height = windowHeight - 32;

    creatorToolbar.style.top = "0px";
    creatorToolbar.style.right = "0px";
    creatorToolbar.style.bottom = "0px";
    creatorToolbar.style.position = "absolute";

    var ratio = fieldWidthPxl / fieldWidthIn;
    var robotWidthPxl = robotWidthIn * ratio;
    var robotHeightPxl = robotHeightIn * ratio;
    var robotCenterPxl = robotCenterIn * ratio;
    var fieldHeightPxl = fieldHeightIn * ratio;

    fieldContext.drawImage(field, 0, 0, fieldWidthPxl, fieldHeightPxl);

    if(fieldMouseRising.l){
    	moveTarget = getTargetRobot();
    }

    if(fieldMouseFalling.l){
    	moveTarget = -1;
    }

    if(fieldMouseRising.r){
    	rotTarget = getTargetRobot();
    }

    if(fieldMouseFalling.r){
    	rotTarget = -1;
    }

    if(moveTarget != -1){
    	robots[moveTarget].y = fieldMousePos.x / ratio;
    	robots[moveTarget].x = fieldMousePos.y / ratio;
    	fieldCanvas.style.cursor = cursors.move;
    }
    else if(rotTarget != -1){
    	var angle = Math.atan2((fieldMousePos.y - robots[rotTarget].x * ratio), (fieldMousePos.x - robots[rotTarget].y * ratio));
        var degrees = (angle * (180/Math.PI)+90);
        robots[rotTarget].rot = -angle + Math.PI * .5;
    	var degrees = (angle * (180/Math.PI)+90);
    	degrees = degrees < 0 ? degrees += 360 : degrees;
        fieldContext.fillStyle = "#ffffff";
        fieldContext.fillText((degrees.toFixed(1) + "\xB0"), fieldMousePos.x + 8, fieldMousePos.y - 8);
    	fieldCanvas.style.cursor = cursors.crosshair;
    } else {
    	fieldCanvas.style.cursor = cursors.default;
    }

    waypoints = [];

    for(var i in robots) {
    	var robotPosXPxl = robots[i].x * ratio;
    	var robotPosYPxl = robots[i].y * ratio;
    	fieldContext.save();
    	fieldContext.translate(Math.floor(robotPosYPxl), Math.floor(robotPosXPxl));
    	fieldContext.rotate(-robots[i].rot);
    	fieldContext.drawImage(robot, Math.floor(-robotWidthPxl * .5),
    	Math.floor(-robotCenterPxl), Math.floor(robotWidthPxl), Math.floor(robotHeightPxl));
    	fieldContext.restore();

    	waypoints.push(new Waypoint(robots[i].x, robots[i].y, robots[i].rot));		
    }

    newSplines = [];
    for(var i = 0; i < waypoints.length-1; i++){
    	newSplines.push(new Spline(waypoints[i], waypoints[i+1]));
    }

    if(newSplines.length != splines.length){
    	splines = newSplines;
    	samples = 5;
    } else {
    	for(var i in newSplines){
    		var n = newSplines[i];
    		var o = splines[i];
    		if((n.e != o.e || n.c != o.c) || n.d != o.d){
    			splines = newSplines;
    			samples = 5;
    			break;
    		}
    	}
    }

    if(newSplines !== splines){
    	if(samples < 15){
    		samples*=1.1;
    	}
    }

    //Draw spline
    var a = splines[0].coord(0);
    fieldContext.moveTo(a.y * ratio, a.x * ratio);
    fieldContext.beginPath();
    fieldContext.lineWidth = Math.floor(windowWidth * .005);
    fieldContext.strokeStyle = "#00ffff";
    var inc = 1 / samples;
    for(var s in splines){
    	var c = splines[s].coord(0);
    	fieldContext.moveTo(c.y * ratio, c.x * ratio);
    	for(var i = 0; i <1; i += inc){
    		c = splines[s].coord(i);
    		fieldContext.lineTo(Math.floor(c.y * ratio), Math.floor(c.x * ratio));
    	}
    	c = splines[s].coord(1);
    	fieldContext.lineTo(Math.floor(c.y * ratio), Math.floor(c.x * ratio));
    }
    fieldContext.stroke();

    oldRobots = robots;
}

function exportPath() {
    var output = "";
    var inc = 1 / samples;
    for(var s in splines){
        var c = splines[s].coord(0);
		output += c.x;
        output += ", ";
        output += c.y;
		output += ", ";
        output += c.theta;
        output += ", \"wp\"";
		output += "\n";
        for(var i = 0 + inc; i <1; i += inc){
            c = splines[s].coord(i);
            output += c.x;
            output += ", ";
            output += c.y;
			output += ", ";
            output += c.theta;
            output += "\n";
        }
    }
    c = splines[splines.length-1].coord(1);
    output += c.x;
    output += ", ";
    output += c.y;
	output += ", ";
    output += c.theta;
	output += ", \"wp\"";
    output += "\n";
    console.log("Path: ");
    console.log(output);

    var file = new File([output], "path.csv", {type: "text/plain;charset=utf-8"});
    saveAs(file);
}

function loadPath(path) {
	robots = [];
	splines = [];
	oldRobots = [];
    waypoints = [];
	rotTarget = -1;
    moveTarget = -1;
	samples = 5;
	var lines = path.split('\n');
	for(var i = 0; i < lines.length; i++){
		if (lines[i].indexOf("wp") != -1) {
			var done = lines[i].split(', ');
			robots.push(new Robot(done[0], done[1], done[2]));
		} 
	}
}