var fieldImage = new Image();
var robotImage = new Image();

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
var robots = [];
var waypoints = [];
var ws;
var selectedRobot;
var lastSelectedRobot;
var isTank = false;

function getTargetRobot() {
    var r = 20;
    var mX = px2inX(fieldMousePos.x);
    var mY = px2inY(fieldMousePos.y);
    var closestRobot = -1;
    var currentLeastDistance = r;
    for (var i = 0; i < robots.length; i++) {
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
    fieldImage.src = "images/field.png";
    robotImage.src = "images/robot.png";
    newRobot(97, 19, 0 , "startRobot");
    // newRobot(97, 100, 0 * (Math.PI / 180));
    newRobot(0, 75, 0, 0, "endRobot");
    // newRobot(-97, 168, 0 * (Math.PI / 180));
}

function newRobot(x, y, robotRotation, splineRotation, robotName) {
    var lastWaypoint;
    if (robots.length !== 0) {
        var lastRobot = robots[robots.length - 1];
        lastWaypoint = waypoints[waypoints.length - 1];
        x = (x === undefined) ? lastRobot.x + 15 : x;
        y = (y === undefined) ? lastRobot.y + 15 : y;
        robotRotation = (robotRotation === undefined) ? lastRobot.rot : robotRotation;
    } else {
        x = (x === undefined) ? 0 : x;
        y = (y === undefined) ? 0 : y;
        robotRotation = (robotRotation === undefined) ? 0 : robotRotation;
    }
    var newRobot = new Robot(x, y, robotRotation, robotName);
    robots.push(newRobot);
    var newWaypoint = new Waypoint(newRobot);
    waypoints.push(newWaypoint);
    if (lastWaypoint) {
        var newSpline = new Spline(lastWaypoint, newWaypoint);
        var lastSpline = splines.length > 0 ? splines[splines.length - 1] : undefined;
        if (lastSpline) {
            newSpline.startTheta = lastSpline.endTheta;
        }
        if (splineRotation !== undefined) {
            newSpline.endTheta = splineRotation;
        }
        splines.push(newSpline);
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
    var robotSelected = false;
    fieldWidthPxl = windowWidth - toolBarWidth - 12;
    ratio = fieldWidthPxl / fieldWidthIn;
    if (fieldMouseRising.l) {
        var selectedIndex = getTargetRobot();
        if (selectedIndex >= 0) {
            lastSelectedRobot = selectedRobot;
            selectedRobot = robots[selectedIndex];
        }
        else {
            lastSelectedRobot = undefined;
            selectedRobot = undefined;
        }
    }
    if (fieldMouseRising.l && lastSelectedRobot === selectedRobot && !(fieldKeyboard.shift || fieldKeyboard.control)) {
        moveTarget = getTargetRobot();
    } else if (fieldMouseRising.l && (fieldKeyboard.shift || fieldKeyboard.control)) {
        rotTarget = getTargetRobot();
    } else if (fieldMouseFalling.l) {
        rotTarget = -1;
        moveTarget = -1;
    }

    moveTargetRobot = (moveTarget >= 0) ? robots[moveTarget] : undefined;
    rotTargetRobot = (rotTarget >= 0) ? robots[rotTarget] : undefined;
    moveTargetWaypoint = (moveTarget >= 0) ? waypoints[moveTarget] : undefined;
    rotTargetWaypoint = (rotTarget >= 0) ? waypoints[rotTarget] : undefined;
    nameTargetRobot = robots[moveTarget];

    // update data
    var mousePosX = px2inX(fieldMousePos.x);
    var mousePosY = px2inY(fieldMousePos.y);
    if (moveTargetRobot) {
        moveTargetRobot.x = mousePosX;
        moveTargetRobot.y = mousePosY;
        fieldCanvas.style.cursor = cursors.move;
    } else if (rotTargetRobot) {
        var angle = Math.atan2((mousePosX - rotTargetRobot.x), (mousePosY - rotTargetRobot.y));
        // adjust spline angle
        if (fieldKeyboard.shift) {
            angle = Math.round(angle / (Math.PI / 8.0)) * (Math.PI / 8.0);
        }
        if (fieldKeyboard.control) {
            var splineAngle = angle + Math.PI / 2;
            while (splineAngle > Math.PI) {
                splineAngle -= Math.PI * 2;
            }
            var leftSpline = rotTarget === 0 ? undefined : splines[rotTarget - 1];
            if (leftSpline) {
                leftSpline.endTheta = splineAngle;
            }
            var rightSpline = rotTarget === splines.length ? undefined : splines[rotTarget];
            if (rightSpline) {
                rightSpline.startTheta = splineAngle;
            }
            var degrees = (splineAngle * (180 / Math.PI));
            fieldContext.fillStyle = "#ffffff";
            fieldContext.fillText((degrees.toFixed(1) + "\xB0"), fieldMousePos.x + 8, fieldMousePos.y - 8);
            fieldCanvas.style.cursor = cursors.crosshair;
        } else {
            // adjust robot angle
            rotTargetRobot.rot = angle;
            while (rotTargetRobot.rot > Math.PI) {
                rotTargetRobot.rot -= Math.PI * 2;
            }
            var degrees = (rotTargetRobot.rot * (180 / Math.PI));
            fieldContext.fillStyle = "#ffffff";
            fieldContext.fillText((degrees.toFixed(1) + "\xB0"), fieldMousePos.x + 8, fieldMousePos.y - 8);
            fieldCanvas.style.cursor = cursors.crosshair;
        }
    } else {
        fieldCanvas.style.cursor = cursors.default;
    }

}

function setTank () {
    isTank = true;
    robots = [];
    splines = [];
    waypoints = [];
    newRobot(97, 19, 0 , "startRobot");
    newRobot(100, 50, 0 , "startRobot");
}

function setSwerve () {
    isTank = false;
    robots = [];
    splines = [];
    waypoints = [];
    newRobot(97, 19, 0 , "startRobot");
    newRobot(100, 50, 0 , "startRobot");
}

function nameRobot() {
    if (selectedRobot) {
        selectedRobot.name = prompt("Name the Robot");
    }
}

function autonCreatorDrawLoop() {
    var robotWidthPxl = robotWidthIn * ratio;
    var robotHeightPxl = robotWidthPxl * (robotImage.height / robotImage.width);
    var robotCenterPxl = robotCenterIn * ratio;
    var fieldHeightPxl = fieldHeightIn * ratio;

    fieldContext.canvas.width = fieldWidthPxl;
    fieldContext.canvas.height = fieldHeightPxl;

    document.getElementById("windowDiv").style.width = fieldWidthPxl + 12 + "px";
    document.getElementById("windowDiv").style.height = (windowHeight - 32) + "px";

    creatorToolbar.style.width = toolBarWidth + "px";
    creatorToolbar.style.height = (windowHeight - 32) + "px";

    fieldContext.drawImage(fieldImage, 0, 0, fieldWidthPxl, fieldHeightPxl);

    // draw
    if(selectedRobot) {
        document.getElementById("statusBarXY").innerText = "X: " + selectedRobot.x.toFixed(1)
            + " Y: " + selectedRobot.y.toFixed(1) + " Rot: " + selectedRobot.rot.toFixed(2)
            + " Path Angle: " + selectedRobot.rot.toFixed(2) + " Name: " + selectedRobot.name;
    } else {
        document.getElementById("statusBarXY").innerText = "X: " + px2inX(fieldMousePos.x).toFixed(1)
            + " Y: " + px2inY(fieldMousePos.y).toFixed(1);
    }


    for (var i in robots) {
        var robotPosXPxl = in2pxX(robots[i].x);
        var robotPosYPxl = in2pxY(robots[i].y);
        var robotRotation = robots[i].rot + Math.PI;
        fieldContext.save();
        fieldContext.translate(Math.floor(robotPosXPxl), Math.floor(robotPosYPxl));
        fieldContext.rotate(robotRotation);
        if(robots[i] === selectedRobot) {
            fieldContext.shadowBlur = 10;
            fieldContext.shadowColor = 'white';
        }
        fieldContext.drawImage(robotImage, Math.floor(-robotWidthPxl * .5), Math.floor(-robotCenterPxl), Math.floor(robotWidthPxl), Math.floor(robotHeightPxl));
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
    fieldContext.moveTo(in2pxX(a.x), in2pxY(a.y));
    fieldContext.beginPath();
    fieldContext.lineWidth = Math.floor(windowWidth * .005);
    fieldContext.strokeStyle = "#00ffff";
    var inc = 1 / samples;
    for (var s in splines) {
        var c = splines[s].coord(0);
        fieldContext.moveTo(in2pxX(c.x), in2pxY(c.y));
        for (var i = inc; i < 1; i += inc) {
            c = splines[s].coord(i);
            fieldContext.lineTo(Math.floor(in2pxX(c.x)), Math.floor(in2pxY(c.y)));
        }
        c = splines[s].coord(1);
        fieldContext.lineTo(Math.floor(in2pxX(c.x)), Math.floor(in2pxY(c.y)));
    }
    fieldContext.stroke();
}

function angleBetweenRobot(a, b) {
    //a += (a < 0 ? 2 * Math.PI : 0);
    //b += (b < 0 ? 2 * Math.PI : 0);
    var dif1 = b - a;
    var dif2 = a - b;
    dif1 += (dif1 < 0 ? 2 * Math.PI : 0);
    dif2 += (dif2 < 0 ? 2 * Math.PI : 0);
    var dif = (Math.abs(dif2) < Math.abs(dif1) ? -dif2 : dif1);
    if (dif > Math.PI) {
        dif = dif - 2 * Math.PI;
    }
    return dif / Math.abs(samples);
}

function pathAsText(pretty) {
    var output = [];
    var inc = 1 / samples;
    for (var s = 0; s < splines.length; s++) {
        var c = splines[s].coord(0);
        var waypoint = {
            "name": robots[s].name,
            "x": Number(c.x.toFixed(2)),
            "y": Number(c.y.toFixed(2)),
            "theta": Number(robots[s].rot.toFixed(2)),
            "pathAngle": Number(splines[s].startTheta.toFixed(2))
        };
        var delta = angleBetweenRobot(robots[s].rot, robots[s + 1].rot);
        var intermediateAngle = robots[s].rot;
        output.push(waypoint);
        for (var i = inc; i < 1; i += inc) {
            intermediateAngle += delta;
            c = splines[s].coord(i);
            var waypoint = {
                "name": "point",
                "x": Number(c.x.toFixed(2)),
                "y": Number(c.y.toFixed(2)),
                "theta": Number(intermediateAngle.toFixed(2))
            };
            output.push(waypoint);
        }
    }
    c = splines[splines.length - 1].coord(1);
    var waypoint = {
        "name": robots[s].name,
        "x": Number(c.x.toFixed(2)),
        "y": Number(c.y.toFixed(2)),
        "theta": Number(robots[robots.length - 1].rot.toFixed(2)),
        "pathAngle": Number(splines[splines.length - 1].endTheta.toFixed(2))
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
    var file = new File([pathAsText(true)], "path.json", { type: "text/plain;charset=utf-8" });
    saveAs(file);
}

function sendPath() {
    ws.send(pathAsText());
}

function loadPath(path) {
    var tmpObj = JSON.parse(path);
    robots = [];
    splines = [];
    waypoints = [];
    rotTarget = -1;
    moveTarget = -1;
    samples = 5;
    for (var i = 0; i < tmpObj.length; i++) {
        var tmpItem = tmpObj[i];
        if (tmpObj[i].name !== "point") {
            newRobot(tmpItem.x, tmpItem.y, tmpItem.theta, tmpItem.pathAngle, tmpItem.name);
        }
    }
    if (robots.length > 1) {
        splines[0].startTheta = tmpObj[0].pathAngle;
    }
}

function connectedToRobot() {
    if(ws) {
        return ws.readyState === ws.OPEN;
    } else {
        return false;
    }

}

function connectToRobot() {
    if (!location.protocol === 'https:') {
        ws = new WebSocket('ws://' + document.location.host + '/path');
        if(!(ws.readyState === ws.CONNECTING || ws.readyState === ws.OPEN)) {
            console.log("Can not connect to: " + 'ws://' + document.location.host + '/path');
            ws = new WebSocket('ws://10.20.62.2:5810/path');
        }
    }
}

function px2inX(px) {
   return (fieldWidthIn / 2) - (px / ratio);
}

function in2pxX(fieldInches) {
   return ratio * ((fieldWidthIn / 2) - fieldInches);
}

function px2inY(px) {
   return (px / ratio);
}

function in2pxY(fieldInches) {
   return fieldInches * ratio;
}

function setSideStartingPos() {
    robots = [];
    splines = [];
    waypoints = [];
    newRobot(97, 19, (-Math.PI / 2), 0, "sideStartWaypoint");
    newRobot(0, 80, 0, 0);
}

function setCenterStartingPos() {
    robots = [];
    splines = [];
    waypoints = [];
    newRobot(8, 19, 0, 0, "centerStartWaypoint");
    newRobot(0, 80, 0, 0);
}

function setScaleStartingPos() {
    robots = [];
    splines = [];
    waypoints = [];
    newRobot(104.5, 310.99, 0, 0, "scaleWaypoint");
    newRobot(0, 80, 0, 0);
}