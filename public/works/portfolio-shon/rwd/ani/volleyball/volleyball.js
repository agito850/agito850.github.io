(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [];


// symbols:



(lib.球沙灘 = function() {
	this.initialize(img.球沙灘);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,768,1366);


(lib.霧氣 = function() {
	this.initialize(img.霧氣);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,1387,321);


(lib.天空 = function() {
	this.initialize(img.天空);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,768,1366);


(lib._3D球球2 = function() {
	this.initialize(img._3D球球2);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,268,267);


(lib.前沙灘 = function() {
	this.initialize(img.前沙灘);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,768,1366);


(lib.海浪 = function() {
	this.initialize(img.海浪);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,927,193);


(lib.點陣圖2 = function() {
	this.initialize(img.點陣圖2);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,217,42);// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.海浪_1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.海浪();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.海浪_1, new cjs.Rectangle(0,0,927,193), null);


(lib.影子 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.點陣圖2();
	this.instance.setTransform(-108,-21);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.影子, new cjs.Rectangle(-108,-21,217,42), null);


(lib.霧元件 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.霧氣();
	this.instance.setTransform(-694,-161);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.霧元件, new cjs.Rectangle(-694,-161,1387,321), null);


(lib.球 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib._3D球球2();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.球, new cjs.Rectangle(0,0,268,267), null);


(lib.海浪移動 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.海浪_1();
	this.instance.setTransform(-0.5,-0.5,1,1,0,0,0,463.5,96.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({y:-25.5},14,cjs.Ease.get(-1)).to({y:-0.5},15,cjs.Ease.get(1)).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-464,-122,927,218);


(lib.霧擺動 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.霧元件();
	this.instance.setTransform(0,0,1,1,0,0,0,-0.5,-0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({x:-29},8).to({x:0},8).to({x:30},9).to({x:0},9).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-722.5,-160.5,1446,321);


// stage content:
(lib.volleyball = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 球
	this.instance = new lib.球();
	this.instance.setTransform(835.8,271.6,0.2515,0.2515,0,0,0,134.2,133.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regY:133.8,scaleX:0.2952,scaleY:0.2952,guide:{path:[835.8,271.6,785.5,359.7,735.2,447.9]}},7,cjs.Ease.get(-1)).to({regX:134.3,regY:134,scaleX:0.3409,scaleY:0.2198,guide:{path:[735.2,447.9,726.5,463.2,717.7,478.5]}},2).to({regX:134.2,regY:133.8,scaleX:0.2952,scaleY:0.2952,guide:{path:[717.8,478.5,717.8,478.5,717.8,478.6,711.6,467,701.3,450.4,698.3,445.7,695.4,441.2]}},2).to({scaleX:0.3353,scaleY:0.3353,guide:{path:[695.4,441.1,677.4,413.5,659.1,391.5,629.3,355.6,602.7,340.3,575.5,324.6,552.9,331.3]}},4,cjs.Ease.get(1)).to({scaleX:0.3754,scaleY:0.3754,rotation:-360,guide:{path:[552.9,331.3,547.9,332.8,543.2,335.3,495.4,361.1,467.5,457.7,462.4,475.1,458.4,493.7]}},4,cjs.Ease.get(-1)).to({regX:134.4,regY:134,scaleX:0.3979,scaleY:0.235,guide:{path:[458.4,493.8,455.4,507.4,453,521.5,450.2,538.3,449.1,549.1,449.1,549.1,449.1,549.1]}},2).to({regX:134.2,regY:133.8,scaleX:0.3754,scaleY:0.3754,guide:{path:[449.1,549,444.1,537.2,435.5,519.9,434.7,518.5,434,517.1]}},2).to({regX:134.3,regY:133.9,scaleX:0.4152,scaleY:0.4152,guide:{path:[434,517.2,417.4,484.3,400.1,458.4,374.7,420.7,351.5,403.5,329.5,387.4,310.4,390.3]}},5,cjs.Ease.get(1)).to({regX:134.2,scaleX:0.4629,scaleY:0.4629,rotation:-720,guide:{path:[310.4,390.2,304.1,391.2,298.1,394.2,254,416.3,239.3,525.1,236.1,548.5,234.6,574.2]}},6,cjs.Ease.get(-1)).to({regX:134.3,scaleX:0.5155,scaleY:0.3032,guide:{path:[234.7,574.2,234,585.8,233.6,597.7,233.1,617,233.4,629.5,232.6,628,231.8,626.3]}},2).to({regX:134.2,scaleX:0.4629,scaleY:0.4629,guide:{path:[231.7,626.2,226.7,616.6,219.3,603.9,216,598.3,212.7,593.1]}},2).to({regX:134.3,regY:134.1,scaleX:0.4921,scaleY:0.4921,guide:{path:[212.7,593.1,198.6,570.2,184.9,553,161.3,523.4,142.4,515.3,125.9,508.2,113.6,518.1]}},4,cjs.Ease.get(1)).to({regY:134,scaleX:0.5358,scaleY:0.5358,rotation:-1080,guide:{path:[113.6,518.1,108.5,522.3,104,529.5,77.1,573.7,79,673.7,79.5,698.7,81.4,721.5]}},6,cjs.Ease.get(-1)).to({regX:134.4,regY:134.3,scaleX:0.5587,scaleY:0.3589,guide:{path:[81.3,721.5,83.2,744.3,86.3,764.9,86.3,764.9,86.3,764.9]}},2).to({regX:134.3,regY:134,scaleX:0.5358,scaleY:0.5358,guide:{path:[86.4,764.8,93,745.4,100.3,727.1]}},2).to({scaleX:0.5679,scaleY:0.5679,guide:{path:[100.3,727.1,108.8,706,118.2,686.3,135.8,649.6,149,637.3,162.1,625.1,170.7,637.3,170.9,637.6,171.1,638]}},4,cjs.Ease.get(1)).to({regY:134.1,scaleX:0.616,scaleY:0.616,rotation:-720,guide:{path:[171.1,638,187.6,663.4,175.1,781.5,171.9,811.5,167.8,840.3]}},6,cjs.Ease.get(-1)).to({regY:134.2,scaleX:0.6752,scaleY:0.445,guide:{path:[167.7,840.4,163.7,868.9,158.9,896.3,158.9,896.3,158.9,896.3]}},2).to({regY:134.1,scaleX:0.616,scaleY:0.616,guide:{path:[158.9,896.2,163,883.1,170.1,864.3,175.5,849.9,181,836.8]}},2).to({regX:134.4,scaleX:0.6445,scaleY:0.6445,guide:{path:[181,836.8,189.7,815.9,198.6,798.6,218.7,759.2,236.6,744,246.6,735.5,255.6,734.8]}},3,cjs.Ease.get(1)).to({regY:134.2,scaleX:0.7108,scaleY:0.7108,rotation:-360,guide:{path:[255.6,734.8,266.8,734,276.5,745.2,308.4,782,323.1,942.8,327.2,987.3,329.3,1029.6]}},7,cjs.Ease.get(-1)).to({regX:134.5,regY:134.3,scaleX:0.7699,scaleY:0.4496,guide:{path:[329.4,1029.5,331.1,1063.6,331.5,1096.2,331.5,1096.2,331.5,1096.2]}},2).to({regX:134.4,regY:134.2,scaleX:0.7108,scaleY:0.7108,guide:{path:[331.5,1096.2,345,1067.4,359.3,1039.7]}},2).to({regX:134.5,scaleX:0.7532,scaleY:0.7532,guide:{path:[359.3,1039.7,374.1,1011.1,389.8,983.6,416.7,936.2,435.2,913.5,453.7,890.9,463.7,893]}},4,cjs.Ease.get(1)).to({regX:134.4,scaleX:0.8275,scaleY:0.8275,rotation:0,guide:{path:[463.7,892.9,466.5,893.5,468.7,896.2,485.9,917.3,508.2,965.6,519.3,989.7,527,1009.6,565.7,1084.9,604.4,1160.2]}},7,cjs.Ease.get(-1)).to({regX:134.5,regY:134.4,scaleX:0.9015,scaleY:0.5343,guide:{path:[604.3,1160.3,628.2,1206.7,652,1253.1]}},2).to({regX:134.4,regY:134.2,scaleX:0.8275,scaleY:0.8275,guide:{path:[652,1253.1,652.5,1254.1,653,1255.1,650.9,1221,648,1187.8]}},2).to({scaleX:0.881,scaleY:0.881,guide:{path:[648.1,1187.8,643.2,1132.8,635.9,1080.3,625.8,1006.6,613.9,970.7,608.2,953.2,602.1,945.2]}},3,cjs.Ease.get(1)).to({scaleX:0.9879,scaleY:0.9879,rotation:-360,guide:{path:[602,945.2,592.6,932.6,582.4,943.2,552.1,974.6,536.5,995.3,528.7,1005.6,526.9,1009.6,401.4,1160.1,275.9,1310.5]}},6,cjs.Ease.get(-1)).to({regX:134.6,regY:134.4,scaleX:1.0912,scaleY:0.826,guide:{path:[275.8,1310.5,250.7,1340.6,225.6,1370.7,225.2,1369.8,224.9,1369]}},2).to({regX:134.4,regY:134.2,scaleX:0.9879,scaleY:0.9879,guide:{path:[224.9,1369,211.9,1333.7,196.7,1298.3]}},2).to({scaleX:1.0357,scaleY:1.0357,guide:{path:[196.7,1298.2,184.5,1269.5,170.9,1240.7,109.2,1110.2,74.7,1107.9,69.5,1107.6,62,1111.7]}},4,cjs.Ease.get(1)).to({regX:133.9,regY:133.7,scaleX:1.1192,scaleY:1.1192,rotation:-720,guide:{path:[61.8,1111.7,18.4,1135.4,-105,1306.6,-161.9,1385.4,-214.6,1464.5]}},7,cjs.Ease.get(-1)).wait(1));

	// 影
	this.instance_1 = new lib.影子();
	this.instance_1.setTransform(838.9,468.35,0.3543,0.3543);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({regX:0.1,regY:0.1,x:787.25,y:490.3},5).to({x:738.45,y:499.05},2).to({regX:0,regY:0,x:717.65,y:507.8},2).to({regX:0.1,regY:0.1,scaleX:0.308,scaleY:0.308,x:692.9,y:520.65},2).to({regX:0.2,regY:0.2,scaleX:0.2385,scaleY:0.2385,x:561.35,y:539.85},3).to({scaleX:0.2154,scaleY:0.2154,x:551.2,y:546.25},1).to({regX:0.3,regY:0.4,scaleX:0.3087,scaleY:0.2849,x:479.65,y:565.45},3).to({regX:0.2,regY:0.3,scaleX:0.371,scaleY:0.3312,x:455.25,y:578.15},2).to({regX:0,regY:0,scaleX:0.4021,scaleY:0.3543,x:448.9,y:580.55},1).to({regX:0.1,scaleX:0.3474,scaleY:0.3133,x:434.3,y:596.9},2).to({regX:0.2,scaleX:0.2655,scaleY:0.2518,x:341.75,y:615.4},3).to({regY:0.2,scaleX:0.2108,scaleY:0.2108,x:306.7,y:627.75},2).to({scaleX:0.3978,scaleY:0.3978,x:239.75,y:658.55},5).to({regX:0.1,regY:0,scaleX:0.5099,scaleY:0.5099,x:231.55,y:665.95},3).to({scaleX:0.4119,scaleY:0.4119,x:211.4,y:697.1},2).to({regX:0.3,scaleX:0.314,scaleY:0.314,x:144.35,y:717.25},2).to({regX:0.2,regY:0.2,scaleX:0.216,scaleY:0.216,x:111.15,y:737.35},2).to({regX:0.3,regY:0.3,scaleX:0.4627,scaleY:0.4627,x:78.9,y:787.65},5).to({regX:0,regY:0.1,scaleX:0.6107,scaleY:0.6107,x:85.1,y:813.25},3).to({regY:0.2,scaleX:0.2207,scaleY:0.2207,x:173.2,y:877.65},6).to({regX:0.1,regY:0,scaleX:0.7719,scaleY:0.7719,x:158.75,y:954.75},8).to({regX:0.4,scaleX:0.3841,scaleY:0.3841,x:256.8,y:1032.65},5).to({regX:0.5,scaleX:0.5394,scaleY:0.5394,x:293.6,y:1077.85},3).to({regX:0,regY:0.2,scaleX:0.8499,scaleY:0.8499,x:331.1,y:1157.25},6).to({regX:0.1,scaleX:0.4284,scaleY:0.4284,x:459.4,y:1235.65},6).to({scaleX:0.7489,scaleY:0.7489,x:509.3,y:1280.55},4).to({regX:0,regY:0.1,scaleX:1.1496,scaleY:1.1496,x:651.55,y:1324.3},5).to({regX:0.1,regY:0.2,scaleX:0.6506,scaleY:0.6506,x:605.65,y:1407.5},5).to({regX:0,regY:0,scaleX:0.7321,scaleY:0.7321,x:224.25,y:1478.5},8).to({x:-214.5,y:1613.8},13).wait(1));

	// 沙灘
	this.instance_2 = new lib.前沙灘();

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(120));

	// 海浪
	this.instance_3 = new lib.海浪移動();
	this.instance_3.setTransform(367.3,364.15,1,1,0,0,0,-0.5,-0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(120));

	// 霧
	this.instance_4 = new lib.霧擺動();
	this.instance_4.setTransform(418.2,126.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(120));

	// 天空
	this.instance_5 = new lib.天空();

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(120));

	// 背景
	this.instance_6 = new lib.球沙灘();

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(120));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(19.6,649,1092.1000000000001,980.2);
// library properties:
lib.properties = {
	id: '01246665AE63F44CBA2F6D4C54089CDC',
	width: 768,
	height: 1366,
	fps: 24,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"images/球沙灘_.jpg", id:"球沙灘"},
		{src:"images/霧氣_.png", id:"霧氣"},
		{src:"images/天空_.png", id:"天空"},
		{src:"images/_3D球球2.png", id:"_3D球球2"},
		{src:"images/前沙灘_.png", id:"前沙灘"},
		{src:"images/海浪_.png", id:"海浪"},
		{src:"images/點陣圖2.png", id:"點陣圖2"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.StageGL();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['01246665AE63F44CBA2F6D4C54089CDC'] = {
	getStage: function() { return exportRoot.stage; },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}


an.makeResponsive = function(isResp, respDim, isScale, scaleType, domContainers) {		
	var lastW, lastH, lastS=1;		
	window.addEventListener('resize', resizeCanvas);		
	resizeCanvas();		
	function resizeCanvas() {			
		var w = lib.properties.width, h = lib.properties.height;			
		var iw = window.innerWidth, ih=window.innerHeight;			
		var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
		if(isResp) {                
			if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
				sRatio = lastS;                
			}				
			else if(!isScale) {					
				if(iw<w || ih<h)						
					sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==1) {					
				sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==2) {					
				sRatio = Math.max(xRatio, yRatio);				
			}			
		}			
		domContainers[0].width = w * pRatio * sRatio;			
		domContainers[0].height = h * pRatio * sRatio;			
		domContainers.forEach(function(container) {				
			container.style.width = w * sRatio + 'px';				
			container.style.height = h * sRatio + 'px';			
		});			
		stage.scaleX = pRatio*sRatio;			
		stage.scaleY = pRatio*sRatio;			
		lastW = iw; lastH = ih; lastS = sRatio;            
		stage.tickOnUpdate = false;            
		stage.update();            
		stage.tickOnUpdate = true;		
	}
}


})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;