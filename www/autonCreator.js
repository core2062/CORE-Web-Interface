var field = new Image();
var robot = new Image();

var rotTarget = -1;
var rotTargetRobot, rotTargetWaypoint;
var moveTarget = -1;
var moveTargetRobot, moveTargetWaypoint;

//properties
var fieldWidthIn = 324;
var fieldHeightIn = 652;
var robotWidthIn = 39;
var robotCenterIn = 19;

var ratio = 1;

var splines = [];
var samples = 5;

var toolBarWidth = 100;
var fieldWidthPxl = 0;

function Robot(x, y, rot) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.rot = parseFloat(rot);
}

var robots = [];
var oldRobots = [];
var waypoints = [];

var ws;

function getTargetRobot() {
    var r = 20;
    ratio = (fieldWidthPxl) / fieldWidthIn;
    var mX = fieldMousePos.x / ratio;
    var mY = fieldMousePos.y / ratio;
    var closestRobot = -1;
    var currentLeastDistance = r;
    for (var i in robots) {
        var distance = hypot(mX, mY, robots[i].x, robots[i].y);
        if (distance < currentLeastDistance) {
            closestRobot = i;
            currentLeastDistance = distance;
        }
    }
    return closestRobot;
}

function autonCreatorInit() {
    connectToRobot();
    splines = [];
    field.src = "images/field.png";
    robot.src = "images/robot.png";
    newRobot(324 / 2, 75, 180 * (Math.PI / 180));
    newRobot(220, 45, 215 * (Math.PI / 180));
    newRobot(290, 75, 90 * (Math.PI / 180));
}

function newRobot(x, y, rotation) {
    var lastWaypoint;
    if (robots.length !== 0) {
        var lastRobot = robots[robots.length - 1];
        lastWaypoint = waypoints[waypoints.length - 1];
        x = (x === undefined) ? lastRobot.x + 15 : x;
        y = (y === undefined) ? lastRobot.y + 15 : y;
        rotation = (rotation === undefined) ? lastRobot.rot : rotation;
    } else {
        x = (x === undefined) ? 0 : x;
        y = (y === undefined) ? 0 : y;
        rotation = (rotation === undefined) ? 0 : rotation;
    }
    var newRobot = new Robot(x, y, rotation);
    robots.push(newRobot);
    var newWaypoint = new Waypoint(newRobot);
    waypoints.push(newWaypoint);
    if (lastWaypoint) {
        splines.push(new Spline(lastWaypoint, newWaypoint));
    }
}

function removeRobot() {
    if (robots.length > 2) {
        robots.pop();
        waypoints.pop();
        splines.pop();
    }
}

function autonCreatorDataLoop() {
    fieldWidthPxl = windowWidth - toolBarWidth;
    ratio = fieldWidthPxl / fieldWidthIn;

    if (fieldMouseRising.l) {
        moveTarget = getTargetRobot();
    } else if (fieldMouseFalling.l) {
        moveTarget = -1;
    } else if (fieldMouseRising.r) {
        rotTarget = getTargetRobot();
    } else if (fieldMouseFalling.r) {
        rotTarget = -1;
    }

    moveTargetRobot = (moveTarget >= 0) ? robots[moveTarget] : undefined;
    rotTargetRobot = (rotTarget >= 0) ? robots[rotTarget] : undefined;
    moveTargetWaypoint = (moveTarget >= 0) ? waypoints[moveTarget] : undefined;
    rotTargetWaypoint = (rotTarget >= 0) ? waypoints[rotTarget] : undefined;

    // update data
    if (moveTargetRobot) {
        moveTargetRobot.x = fieldMousePos.x / ratio;
        moveTargetRobot.y = fieldMousePos.y / ratio;
        moveTargetWaypoint.x = moveTargetRobot.x;
        moveTargetWaypoint.y = moveTargetRobot.y;
    } else if (rotTargetRobot) {
        var angle = Math.atan2((fieldMousePos.x - rotTargetRobot.x * ratio), (fieldMousePos.y - rotTargetRobot.y * ratio));
        // adjust spline angle
        if (fieldKeyboard.shift) {
            angle = Math.round(angle / (Math.PI / 8.0)) * (Math.PI / 8.0);
        }
        if (fieldKeyboard.control) {
            var splineAngle = angle + Math.PI / 2;
            while (splineAngle > Math.PI) {
                splineAngle -= Math.PI * 2;
            }
            var leftSpline = rotTarget == 0 ? undefined : splines[rotTarget - 1];
            if (leftSpline) {
                leftSpline.endTheta = splineAngle;
            }
            var rightSpline = rotTarget == splines.length ? undefined : splines[rotTarget];
            if (rightSpline) {
                rightSpline.startTheta = splineAngle;
            }
        } else {
            // adjust robot angle
            rotTargetRobot.rot = angle + Math.PI / 2;
            while (rotTargetRobot.rot > Math.PI) {
                rotTargetRobot.rot -= Math.PI * 2;
            }
        }
    }
}

function autonCreatorDrawLoop() {
    fieldContext.canvas.width = fieldWidthPxl;
    fieldContext.canvas.height = windowHeight - 32;

    creatorToolbar.style.width = String(toolBarWidth) + "px";
    creatorToolbar.style.height = String(windowHeight - 32) + "px";
    creatorToolbar.style.top = "0px";
    creatorToolbar.style.right = "0px";
    creatorToolbar.style.bottom = "0px";
    creatorToolbar.style.position = "absolute";

    var robotWidthPxl = robotWidthIn * ratio;
    var robotHeightPxl = robotWidthPxl * (robot.height / robot.width);
    var robotCenterPxl = robotCenterIn * ratio;
    var fieldHeightPxl = fieldHeightIn * ratio;

    fieldContext.drawImage(field, 0, 0, fieldWidthPxl, fieldHeightPxl);

    // draw
    if (moveTargetRobot) {
        fieldCanvas.style.cursor = cursors.move;
    } else if (rotTargetRobot) {
        var degrees = 360 - (rotTargetRobot.rot * (180 / Math.PI));
        while (degrees > 180) {
            degrees -= 360;
        }
        fieldContext.fillStyle = "#ffffff";
        fieldContext.fillText((degrees.toFixed(1) + "\xB0"), fieldMousePos.x + 8, fieldMousePos.y - 8);
        fieldCanvas.style.cursor = cursors.crosshair;
    } else {
        fieldCanvas.style.cursor = cursors.default;
    }
    fieldContext.fillStyle = "#ffffff";
    fieldContext.fillText("X: " + pixelsToFieldInches(fieldMousePos.x).toFixed(1) + " Y: " + pixelsToFieldInches(fieldMousePos.y).toFixed(1), 8, 8);

    for (var i in robots) {
        var robotPosXPxl = robots[i].x * ratio;
        var robotPosYPxl = robots[i].y * ratio;
        var robotRotation = -robots[i].rot - Math.PI / 2;
        fieldContext.save();
        fieldContext.translate(Math.floor(robotPosXPxl), Math.floor(robotPosYPxl));
        fieldContext.rotate(robotRotation);
        fieldContext.drawImage(robot, Math.floor(-robotWidthPxl * .5), Math.floor(-robotCenterPxl), Math.floor(robotWidthPxl), Math.floor(robotHeightPxl));
        fieldContext.restore();
    }

    if (moveTargetRobot || rotTargetRobot) {
        // data changed
        samples = 5;
    } else if (samples < 15) {
        samples *= 1.1;
    }

    //Draw spline
    var a = splines[0].coord(0);
    fieldContext.moveTo(a.x * ratio, a.y * ratio);
    fieldContext.beginPath();
    fieldContext.lineWidth = Math.floor(windowWidth * .005);
    fieldContext.strokeStyle = "#00ffff";
    var inc = 1 / samples;
    for (var s in splines) {
        var c = splines[s].coord(0);
        fieldContext.moveTo(c.x * ratio, c.y * ratio);
        for (var i = inc; i < 1; i += inc) {
            c = splines[s].coord(i);
            fieldContext.lineTo(Math.floor(c.x * ratio), Math.floor(c.y * ratio));
        }
        c = splines[s].coord(1);
        fieldContext.lineTo(Math.floor(c.x * ratio), Math.floor(c.y * ratio));
    }
    fieldContext.stroke();
}

function pathAsText(pretty) {
    var output = [];
    var inc = 1 / samples;
    for (var s in splines) {
        var c = splines[s].coord(0);
        var waypoint = {
            "name": "wp",
            "x": Number(fieldWidthIn - c.x.toFixed(2)),
            "y": Number(c.y.toFixed(2)),
            "theta": 0,
            "pathAngle": Number(splines[s].startTheta().toFixed(2))
        };
        output.push(waypoint);
        for (var i = inc; i < 1; i += inc) {
            c = splines[s].coord(i);
            var waypoint = {
                "name": "point",
                "x": Number(fieldWidthIn - c.x.toFixed(2)),
                "y": Number(c.y.toFixed(2))
            };
            output.push(waypoint);
        }
    }
    c = splines[splines.length - 1].coord(1);
    var waypoint = {
        "name": "wp",
        "x": Number(fieldWidthIn - c.x.toFixed(2)),
        "y": Number(c.y.toFixed(2)),
        "theta": 0,
        "pathAngle": Number(splines[s].startTheta().toFixed(2))
    };
    output.push(waypoint);
    console.log("Path: ");
    console.log(output);
    if (pretty === true) {
        return JSON.stringify(output, null, 4);
    } else {
        return JSON.stringify(output);
    }
}

function exportPath() {
    var file = new File([pathAsText()], "path.json", { type: "text/plain;charset=utf-8" });
    saveAs(file);
}

function sendPath() {
    ws.send(pathAsText());
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
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("wp") !== -1) {
            var done = lines[i].split(', ');
            robots.push(new Robot(done[0], done[1], done[2]));
        }
    }
}

function connectToRobot() {
    ws = new WebSocket('ws://' + document.location.host + '/path');
}

function pixelsToFieldInches(px) {
    return px / ratio;
}
