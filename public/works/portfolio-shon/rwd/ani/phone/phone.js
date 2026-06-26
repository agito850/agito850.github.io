(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [];


// symbols:



(lib._1 = function() {
	this.initialize(img._1);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,443,956);


(lib._2 = function() {
	this.initialize(img._2);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,443,956);


(lib._3 = function() {
	this.initialize(img._3);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,443,956);


(lib._4 = function() {
	this.initialize(img._4);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,443,956);


(lib._5 = function() {
	this.initialize(img._5);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,443,956);


(lib.手機本尊背面 = function() {
	this.initialize(img.手機本尊背面);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,1200,1200);


(lib.手機本尊鏡頭 = function() {
	this.initialize(img.手機本尊鏡頭);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,1200,1200);


(lib.手機本尊正面2_ = function() {
	this.initialize(img.手機本尊正面2_);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,800,800);


(lib.背景燈 = function() {
	this.initialize(img.背景燈);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,800,600);


(lib.背景 = function() {
	this.initialize(img.背景);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,800,600);// helper functions:

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


(lib.相片5 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib._5();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.相片5, new cjs.Rectangle(0,0,443,956), null);


(lib.相片4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib._4();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.相片4, new cjs.Rectangle(0,0,443,956), null);


(lib.相片3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib._3();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.相片3, new cjs.Rectangle(0,0,443,956), null);


(lib.相片2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib._2();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.相片2, new cjs.Rectangle(0,0,443,956), null);


(lib.相片1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib._1();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.相片1, new cjs.Rectangle(0,0,443,956), null);


(lib.燈 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.背景燈();
	this.instance.setTransform(-400,-300);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.燈, new cjs.Rectangle(-400,-300,800,600), null);


(lib.光 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.shape = new cjs.Shape();
	this.shape.graphics.lf(["rgba(255,255,255,0)","rgba(255,255,255,0.498)","rgba(255,255,255,0)"],[0,0.482,1],0,-151.5,0,151.6).s().p("EjCZAXrMAAAgvVMGEzAAAMAAAAvVg");
	this.shape.setTransform(553.3,67.473,1,0.7691);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.光, new cjs.Rectangle(-690.9,-49.1,2488.4,233.1), null);


(lib.背面手機閃光 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 遮 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("EgcJBMgQi/AAiHiHQiGiGAAi/MAAAiKnQAAi/CGiHQCHiGC/AAMA4TAAAQC/AACGCGQCHCHAAC/MAAACKnQAAC/iHCGQiGCHi/AAg");
	mask.setTransform(-0.4,-45.225);

	// 光
	this.instance = new lib.光();
	this.instance.setTransform(-3.05,-730.5,1,1,0,0,0,553.3,67.5);
	this.instance._off = true;

	var maskedShapeInstanceList = [this.instance];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(59).to({_off:false},0).to({y:553.35},20).to({rotation:360,y:-730.5},20).wait(1));

	// 背面
	this.instance_1 = new lib.手機本尊背面();
	this.instance_1.setTransform(-600,-600);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(100));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1247.2,-1693.1,2488.4,3209.1);


(lib.相片切換 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 相片1
	this.instance = new lib.相片1();
	this.instance.setTransform(0,0,1,1,0,0,0,221.5,478);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(210).to({_off:false},0).to({alpha:1},10).wait(1));

	// 相片5
	this.instance_1 = new lib.相片5();
	this.instance_1.setTransform(0,0,1,1,0,0,0,221.5,478);
	this.instance_1.alpha = 0;
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(166).to({_off:false},0).to({alpha:1},9).wait(35).to({alpha:0},10).wait(1));

	// 相片4
	this.instance_2 = new lib.相片4();
	this.instance_2.setTransform(0,0,1,1,0,0,0,221.5,478);
	this.instance_2.alpha = 0;
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(122).to({_off:false},0).to({alpha:1},9).wait(35).to({alpha:0},10).to({_off:true},1).wait(44));

	// 相片3
	this.instance_3 = new lib.相片3();
	this.instance_3.setTransform(0,0,1,1,0,0,0,221.5,478);
	this.instance_3.alpha = 0;
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(78).to({_off:false},0).to({alpha:1},9).wait(35).to({alpha:0},10).to({_off:true},1).wait(88));

	// 相片2
	this.instance_4 = new lib.相片2();
	this.instance_4.setTransform(0,0,1,1,0,0,0,221.5,478);
	this.instance_4.alpha = 0;
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(34).to({_off:false},0).to({alpha:1},9).wait(35).to({alpha:0},10).to({_off:true},1).wait(132));

	// 相片1
	this.instance_5 = new lib.相片1();
	this.instance_5.setTransform(0,0,1,1,0,0,0,221.5,478);

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(34).to({alpha:0},10).to({_off:true},1).wait(176));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-221.5,-478,443,956);


(lib.正面手機整隻 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 鏡頭
	this.instance = new lib.手機本尊鏡頭();
	this.instance.setTransform(-600,-600);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	// 遮 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("EgbxBI7QiOAAhlhlQhlhlAAiOMAAAiHFQAAiOBlhlQBlhlCOAAMA3jAAAQCOAABlBlQBlBlAACOMAAACHFQAACOhlBlQhlBliOAAg");
	mask.setTransform(5.975,-59.075);

	// 相片
	this.instance_1 = new lib.相片切換();
	this.instance_1.setTransform(6.3,-52.75);

	var maskedShapeInstanceList = [this.instance_1];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1));

	// 正面
	this.instance_2 = new lib.手機本尊正面2_();
	this.instance_2.setTransform(-601,-598,1.5009,1.4818);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.正面手機整隻, new cjs.Rectangle(-601,-600,1201,1200), null);


// stage content:
(lib.phone = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 燈光
	this.instance = new lib.燈();
	this.instance.setTransform(400,71.25,0.8262,0.8262);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(45).to({_off:false},0).wait(2).to({alpha:1},0).wait(1).to({alpha:0},0).wait(1).to({alpha:1},0).wait(2).to({alpha:0},0).wait(2).to({regX:0.1,regY:-138.3,x:400.1,y:-43,alpha:1},0).to({regY:-138.2,rotation:10.2496,x:400.05,y:-42.95},37).to({regY:-138.3,rotation:-14.9985,x:400.1,y:-43},38).to({regY:-138.2,rotation:10.2496,x:400.05,y:-42.95},41).to({regY:-138.3,rotation:-14.9985,x:400.1,y:-43},45).to({regY:-138.2,rotation:10.2496,x:400.05,y:-42.95},55).wait(1));

	// 手機正面
	this.instance_1 = new lib.正面手機整隻();
	this.instance_1.setTransform(248,-6.8,0.3673,0.3673,0,0,0,0,433.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({y:484.65},14,cjs.Ease.get(-1)).to({regX:0.1,regY:434,rotation:-5.4728,x:248.05,y:463.45},5).to({regX:0,regY:433.9,rotation:0,x:248,y:484.65},4).to({regX:0.1,regY:434,rotation:4.2213,x:248.05,y:484.7},4).to({regX:0,regY:434.2,rotation:-2.9836,y:484.75},2).to({regX:-0.1,regY:433.9,rotation:2.4903,x:462.55,y:484.65},10,cjs.Ease.get(1)).to({regX:0.1,regY:434.1,rotation:-2.4499,x:462.6,y:484.7},3).to({regX:0,regY:433.9,rotation:0,x:462.55,y:484.65},3).wait(225));

	// 手機背面
	this.instance_2 = new lib.背面手機閃光();
	this.instance_2.setTransform(558.15,-13.05,0.3674,0.3674,0,0,0,-3,444.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({y:465.5},14,cjs.Ease.get(-1)).to({regX:-2.9,regY:444.6,rotation:5.2209,x:558.2,y:461.55},5).to({regX:-3,regY:444.4,rotation:0,x:558.15,y:465.5},4).to({regX:-2.9,regY:444.7,rotation:-4.464,y:465.6},4).to({regX:-3.1,regY:444.6,rotation:3.2428,x:558.1,y:465.65},2).to({regX:-2.9,rotation:-3.4956,x:347.2,y:465.6},10,cjs.Ease.get(1)).to({regX:-2.8,regY:444.7,rotation:2.49},3).to({regX:-3,regY:444.4,rotation:0,x:347.15,y:465.5},3).wait(225));

	// 背景
	this.instance_3 = new lib.背景();
	this.instance_3.setTransform(1,1);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(270));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(392.1,-96.7,421.6,697.7);
// library properties:
lib.properties = {
	id: '66CAD23C42BD2544889B1D01BA321CB3',
	width: 800,
	height: 600,
	fps: 24,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"images/_1.jpg", id:"_1"},
		{src:"images/_2.jpg", id:"_2"},
		{src:"images/_3.jpg", id:"_3"},
		{src:"images/_4.jpg", id:"_4"},
		{src:"images/_5.jpg", id:"_5"},
		{src:"images/手機本尊背面_.png", id:"手機本尊背面"},
		{src:"images/手機本尊鏡頭_.png", id:"手機本尊鏡頭"},
		{src:"images/手機本尊正面2_.png", id:"手機本尊正面2_"},
		{src:"images/背景燈_.png", id:"背景燈"},
		{src:"images/背景_.png", id:"背景"}
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
an.compositions['66CAD23C42BD2544889B1D01BA321CB3'] = {
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