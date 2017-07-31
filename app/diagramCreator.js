var roborio = new Image();

var fieldCanvas;
var fieldContext;
var flowCanvas;
var flowContext;

var fieldWidthIn = 324;
var fieldHeightIn = 652;
var robotWidthIn = 39.5;
var robotHeightIn = 35.5;
var robotCenterIn = 19;

function diagramCreatorInit() {
    fieldCanvas = document.getElementById('fieldCanvas');
	fieldContext = fieldCanvas.getContext('2d');
	flowCanvas = document.getElementById('flowCanvas');
	flowContext = flowCanvas.getContext('2d');

	roborio.src = "images/robot.png";
}

function diagramCreatorStart() {
    view = 'diagram-creator'
	if(fieldCanvas == undefined){
		diagramCreatorInit();
	}
	window.requestAnimationFrame(diagramCreatorLoop);
}

function diagramCreatorLoop() {
    updateInput();
    windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;

	fieldContext.canvas.width = windowWidth * .75;
	fieldContext.canvas.height = windowHeight * .90;
	var fieldWidthPxl = windowWidth * .75;

	fieldContext.clearRect(0,0,fieldWidthPxl,windowHeight);

	fieldContext.drawImage(roborio, 0, 0, 100, 100);

    if(view == 'diagram-creator'){
		fieldCanvas.style.visibility = 'visible';
		flowCanvas.style.visibility = 'visible';
		window.requestAnimationFrame(diagramCreatorLoop);
	} else {
		fieldCanvas.style.visibility = 'hidden';
		flowCanvas.style.visibility = 'hidden';
	}
}
