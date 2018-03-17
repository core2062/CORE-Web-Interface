var fieldMousePos = {x:0,y:0};
var fieldMouseButton = {l:false,m:false,r:false};
var fieldMouseOld = {l:false,m:false,r:false};
var fieldMouseRising = {l:false,m:false,r:false};
var fieldMouseFalling = {l:false,m:false,r:false};

var fieldKeyboard = {shift:false};
var fieldKeyboardOld = {shift:false};
var fieldKeyboardRising = {shift:false};
var fieldKeyboardFalling = {shift:false};

var cursors = {
	default:"default",
	crosshair:"crosshair",
	move:"move"
}

var canvas = document.getElementById('windowCanvas');

canvas.setAttribute("tabindex", 0);

canvas.oncontextmenu = function(evt){
	evt.preventDefault();
    evt.stopPropagation();
}

canvas.addEventListener('mousemove', function(evt) {
	var cnv = document.getElementById('windowCanvas');
	var rect = cnv.getBoundingClientRect();
	fieldMousePos = {
		x: Math.floor((evt.clientX-rect.left)/(rect.right-rect.left)*cnv.width),
		y: Math.floor((evt.clientY-rect.top)/(rect.bottom-rect.top)*cnv.height)
	};
}, false);

canvas.addEventListener('mousedown', function(evt){
    if(evt.button === 0){
		fieldMouseButton.l = true;
	} else if(evt.button === 1){
		fieldMouseButton.m = true;
	} else if(evt.button === 2){
		fieldMouseButton.r = true;
	}
}, false);

canvas.addEventListener('mouseup', function(evt){
	if(evt.button === 0){
		fieldMouseButton.l = false;
	} else if(evt.button === 1){
		fieldMouseButton.m = false;
	} else if(evt.button === 2){
		fieldMouseButton.r = false;
	}
}, false);

canvas.addEventListener('keydown', function(evt){
    if(evt.keyCode === 16) {
        fieldKeyboard.shift = true;
    }
}, false);

canvas.addEventListener('keyup', function(evt){
    if(evt.keyCode === 16) {
        fieldKeyboard.shift = false;
    }
}, false);

function updateInput(){
	fieldMouseRising.l = fieldMouseButton.l && !fieldMouseOld.l;
	fieldMouseFalling.l = !fieldMouseButton.l && fieldMouseOld.l;
	fieldMouseRising.m = fieldMouseButton.m && !fieldMouseOld.m;
	fieldMouseFalling.m = !fieldMouseButton.m && fieldMouseOld.m;
	fieldMouseRising.r = fieldMouseButton.r && !fieldMouseOld.r;
	fieldMouseFalling.r = !fieldMouseButton.r && fieldMouseOld.r;
	fieldMouseOld.l = fieldMouseButton.l;
	fieldMouseOld.r = fieldMouseButton.r;
	fieldMouseOld.m = fieldMouseButton.m;

	fieldKeyboardRising.shift = fieldKeyboard.shift && !fieldKeyboardOld.shift;
    fieldKeyboardFalling.shift = !fieldKeyboard.shift && fieldKeyboardOld.shift;
    fieldKeyboardOld.shift = fieldKeyboard.shift;
}

