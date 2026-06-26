(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [];


// symbols:



(lib.紅魚 = function() {
	this.initialize(img.紅魚);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,266,118);


(lib.按鈕 = function() {
	this.initialize(img.按鈕);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,284,113);


(lib.小丑魚 = function() {
	this.initialize(img.小丑魚);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,260,143);


(lib.紫魚 = function() {
	this.initialize(img.紫魚);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,270,132);


(lib.水怪01 = function() {
	this.initialize(img.水怪01);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,2230,1054);


(lib.水怪02 = function() {
	this.initialize(img.水怪02);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,175,409);


(lib.水怪03 = function() {
	this.initialize(img.水怪03);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,552,315);


(lib.水怪04 = function() {
	this.initialize(img.水怪04);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,613,503);


(lib.水怪05 = function() {
	this.initialize(img.水怪05);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,331,506);


(lib.魟魚 = function() {
	this.initialize(img.魟魚);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,413,222);


(lib.海底世界背景 = function() {
	this.initialize(img.海底世界背景);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,1367,768);


(lib.泡泡 = function() {
	this.initialize(img.泡泡);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,300,326);


(lib.熱帶魚 = function() {
	this.initialize(img.熱帶魚);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,239,230);


(lib.點陣圖1 = function() {
	this.initialize(img.點陣圖1);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,626,158);// helper functions:

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


(lib.隱形按鈕 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#00FF33").s().p("A0YPeIAA+7MAoxAAAIAAe7g");
	this.shape._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(3).to({_off:false},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-130.5,-99,261,198);


(lib.熱帶魚元件 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.熱帶魚();
	this.instance.setTransform(218.8,0,0.9155,1,0,0,180);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.熱帶魚元件, new cjs.Rectangle(0,0,218.8,230), null);


(lib.泡泡元件 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.泡泡();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.泡泡元件, new cjs.Rectangle(0,0,300,326), null);


(lib.影子 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.點陣圖1();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.影子, new cjs.Rectangle(0,0,626,158), null);


(lib.魟魚元件 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.魟魚();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.魟魚元件, new cjs.Rectangle(0,0,413,222), null);


(lib.尼身體 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.水怪01();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.尼身體, new cjs.Rectangle(0,0,2230,1054), null);


(lib.尼左腳 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.水怪04();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.尼左腳, new cjs.Rectangle(0,0,613,503), null);


(lib.尼左手 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.水怪05();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.尼左手, new cjs.Rectangle(0,0,331,506), null);


(lib.尼右腳 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.水怪03();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.尼右腳, new cjs.Rectangle(0,0,552,315), null);


(lib.尼右手 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.水怪02();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.尼右手, new cjs.Rectangle(0,0,175,409), null);


(lib.紫魚元件 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.紫魚();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.紫魚元件, new cjs.Rectangle(0,0,270,132), null);


(lib.小丑魚元件 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.小丑魚();
	this.instance.setTransform(0,0,0.4696,0.4696);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.小丑魚元件, new cjs.Rectangle(0,0,122.1,67.2), null);


(lib.按鈕元件 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.按鈕();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.按鈕元件, new cjs.Rectangle(0,0,284,113), null);


(lib.紅魚_1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.紅魚();
	this.instance.setTransform(266,0,1,1,0,0,180);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.紅魚_1, new cjs.Rectangle(0,0,266,118), null);


(lib.泡泡往上 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.泡泡元件();
	this.instance.setTransform(36.45,-59.5,0.2948,0.2948,0,0,0,150,163);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:149.8,regY:162.9,scaleX:0.3867,scaleY:0.3867,x:-29.6,y:-166.35},8).to({regX:149.9,regY:162.8,scaleX:0.4637,scaleY:0.4637,x:70.6,y:-286.6},8).to({regX:149.8,scaleX:0.5404,scaleY:0.5404,x:-57.2,y:-414.05},9).to({regX:149.9,regY:162.7,scaleX:0.6173,scaleY:0.6173,x:109.4,y:-606.55},9).to({scaleX:0.7096,scaleY:0.7096,x:-70.95,y:-707.35},11).to({regX:149.8,regY:162.8,scaleX:0.7863,scaleY:0.7863,x:60.55,y:-815.4},12).to({regX:149.6,scaleX:0.868,scaleY:0.868,x:-76.05,y:-900.75},14).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-205.9,-1042,408,1030.6);


(lib.尼斯游泳 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 尼左手
	this.instance = new lib.尼左手();
	this.instance.setTransform(-155.85,170.35,1,1,-11.1722,0,0,73.8,57.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:73.9,rotation:24.5518,x:-183.05,y:163.65},32).to({regX:73.7,rotation:-41.0694,x:-129.7,y:172.9},16).to({regX:73.8,rotation:-11.1722,x:-155.85,y:170.35},22).wait(1));

	// 尼左腳
	this.instance_1 = new lib.尼左腳();
	this.instance_1.setTransform(242.5,52.25,1,1,-11.1722,0,0,55.5,15.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:13.7591,x:225.05,y:85.85},32).to({regX:55.6,regY:15.6,rotation:-36.2972,x:259.15,y:26.1},16).to({regX:55.5,regY:15.5,rotation:-11.1722,x:242.5,y:52.25},22).wait(1));

	// 尼身體
	this.instance_2 = new lib.尼身體();
	this.instance_2.setTransform(76.65,227.65,1,1,-11.1722,0,0,1216,980.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({rotation:-5.447,x:42.55,y:243.7},32).to({regY:980.1,rotation:-15.3328,x:106.4,y:213.05},16).to({regY:980.2,rotation:-11.1722,x:76.65,y:227.65},22).wait(1));

	// 尼右腳
	this.instance_3 = new lib.尼右腳();
	this.instance_3.setTransform(422.95,-20.2,1,1,-11.1722,0,0,79,18.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({regX:78.9,rotation:9.5519,x:411.8,y:31.65},32).to({regX:79,rotation:-27.541,x:433.8,y:-59.25},16).to({rotation:-11.1722,x:422.95,y:-20.2},22).wait(1));

	// 尼右手
	this.instance_4 = new lib.尼右手();
	this.instance_4.setTransform(-200.15,202,1,1,-11.1722,0,0,106.2,32.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({regX:106.3,rotation:15.7746,x:-230.25,y:190.7},32).to({regX:106.2,rotation:-60.334,x:-171.45,y:207.7},16).to({rotation:-11.1722,x:-200.15,y:202},22).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1325.4,-1000.2,2429.3,1692.2);


(lib.紫魚群 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.紫魚元件();
	this.instance.setTransform(474.85,-46.75,0.3908,0.3091,0,0,0,135,65.8);

	this.instance_1 = new lib.紫魚元件();
	this.instance_1.setTransform(389.7,-5.95,0.3908,0.3091,0,0,0,135,65.8);

	this.instance_2 = new lib.紫魚元件();
	this.instance_2.setTransform(-169,-20.4,0.3582,0.2821,0,0,0,134.9,65.8);

	this.instance_3 = new lib.紫魚元件();
	this.instance_3.setTransform(-245.65,-57.65,0.3582,0.2821,0,0,0,134.9,65.8);

	this.instance_4 = new lib.紫魚元件();
	this.instance_4.setTransform(225.65,-9.95,0.4394,0.4394,0,0,0,134.9,66);

	this.instance_5 = new lib.紫魚元件();
	this.instance_5.setTransform(317.65,-48.45,0.4394,0.4394,0,0,0,134.9,66);

	this.instance_6 = new lib.紫魚元件();
	this.instance_6.setTransform(233.9,-93.95,0.5,0.3485,0,0,0,135,66);

	this.instance_7 = new lib.紫魚元件();
	this.instance_7.setTransform(140,-44.2,0.5037,0.5037,0,0,0,135.1,66);

	this.instance_8 = new lib.紫魚元件();
	this.instance_8.setTransform(40.4,-89.95,0.642,0.5606,0,0,0,134.9,66);

	this.instance_9 = new lib.紫魚元件();
	this.instance_9.setTransform(4.1,-10,0.5909,0.5001,0,0,0,134.9,65.9);

	this.instance_10 = new lib.紫魚元件();
	this.instance_10.setTransform(-91.65,-68.95,0.4545,0.4545,0,0,0,134.9,66);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_10},{t:this.instance_9},{t:this.instance_8},{t:this.instance_7},{t:this.instance_6},{t:this.instance_5},{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.紫魚群, new cjs.Rectangle(-293.9,-126.9,821.5,150), null);


(lib.紅魚群 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 圖層_1
	this.instance = new lib.紅魚_1();
	this.instance.setTransform(357.55,14.05,0.5119,0.2927,0,0,0,133.2,58.8);

	this.instance_1 = new lib.紅魚_1();
	this.instance_1.setTransform(117.6,12.85,0.2944,0.2722,0,0,0,133.5,59);

	this.instance_2 = new lib.紅魚_1();
	this.instance_2.setTransform(386.1,-60,0.5838,0.4508,0,0,0,133.2,58.9);

	this.instance_3 = new lib.紅魚_1();
	this.instance_3.setTransform(-407.65,-36.75,0.5728,0.4101,0,0,0,133,58.9);

	this.instance_4 = new lib.紅魚_1();
	this.instance_4.setTransform(5.15,50.05,0.6391,0.5763,0,0,0,133.1,59);

	this.instance_5 = new lib.紅魚_1();
	this.instance_5.setTransform(202.1,39.7,0.585,0.4,0,0,0,133.2,59.1);

	this.instance_6 = new lib.紅魚_1();
	this.instance_6.setTransform(261.25,-14.95,0.4864,0.4103,0,0,0,133.4,58.9);

	this.instance_7 = new lib.紅魚_1();
	this.instance_7.setTransform(-247.9,0.7,0.6391,0.4547,0,0,0,133.1,59);

	this.instance_8 = new lib.紅魚_1();
	this.instance_8.setTransform(-175.95,-46.95,0.5128,0.4624,0,0,0,133,59);

	this.instance_9 = new lib.紅魚_1();
	this.instance_9.setTransform(-82,-2.85,0.5466,0.4437,0,0,0,133,59);

	this.instance_10 = new lib.紅魚_1();
	this.instance_10.setTransform(-26.95,-67.95,0.6391,0.5763,0,0,0,133.1,59);

	this.instance_11 = new lib.紅魚_1();
	this.instance_11.setTransform(41,-8.9,0.4462,0.3408,0,0,0,133,59);

	this.instance_12 = new lib.紅魚_1();
	this.instance_12.setTransform(133.65,-47,0.6391,0.4791,0,0,0,133.1,59);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_12},{t:this.instance_11},{t:this.instance_10},{t:this.instance_9},{t:this.instance_8},{t:this.instance_7},{t:this.instance_6},{t:this.instance_5},{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.紅魚群, new cjs.Rectangle(-483.8,-101.9,947.5,186), null);


(lib.一串泡泡 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// _4
	this.instance = new lib.泡泡往上();
	this.instance.setTransform(-6.5,-28.5,0.2768,0.2768,0,0,0,36.5,-59.6);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(14).to({_off:false},0).wait(76));

	// _3
	this.instance_1 = new lib.泡泡往上();
	this.instance_1.setTransform(29.35,-41.3,0.2768,0.2768,0,0,0,36.5,-59.6);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(9).to({_off:false},0).wait(81));

	// _2
	this.instance_2 = new lib.泡泡往上();
	this.instance_2.setTransform(-6.5,-67.9,0.2768,0.2768,0,0,0,36.5,-59.6);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(4).to({_off:false},0).wait(86));

	// _1
	this.instance_3 = new lib.泡泡往上();
	this.instance_3.setTransform(31.35,-85.85,0.2768,0.2768,0,0,0,36.5,-59.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(90));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-18.7,-99.1,62.3,84);


// stage content:
(lib.sea = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
		
		this.play_btn.addEventListener("click", playmv.bind(this));
		
		function playmv()
		{
			this.play();
			this.nswim_mc.play();
			
		}
		
		
		this.stop_btn.addEventListener("click", stopmv.bind(this));
		
		function stopmv()
		{
			this.stop();
			this.nswim_mc.stop();
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(390));

	// 提示
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AhIHeQgLgGgIgLQgJgKgFgLQgFgNAAgKIABgZIAEgkIADgqIAEgrIAEgmIADgcIAIhZQADgjAAgSQAAgJgCgJIgEgPQgbgQgZgVQgZgYgWgYIgQgSIgUgYIgWgaIgUgXIgOgRIgFgJIglgpIgfgiQgNgPgIgLQgIgMAAgHQAAgKAIgLQAJgMATgKQARgKAMgCQAMgCAJAAQAQAAAPAJQAPAIASARQASARAVAbIAxA7QAvA9AjAjQAjAjARAHQgBgBAIgNIAWggIAgguIAmg0IAlg1IAigtIAXgiIAJgMIAagkIAcgnIAOgVQAGgJAHgGQAHgGAIgCQAJgDAMgBQAYAAARAKQANAGAHALQAHAKAAAMIgBALIgDANQgNAfgaAkQgaAlgfAnIhBBQQghAogdAnQgLAQgJAPIgZAoIgMATIgOAWIgRAZIgOAVQgFBHgDBKIgICXIgDA/QgBAYgCAGQgGAZgVAMQgUAMgdAAQgNAAgMgIg");
	this.shape.setTransform(960.725,194);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AmFGiQgUgGgNgKQgOgKgGgLQgIgMABgJQgBgTARgHQAPgIAcgFIAGgIIAOgRIARgTIAKgPIAtg9IAyhJIAAAAIAYgiIARgZIARgZIAVgfQAjguAZghIApg3IAlg6IAPgYIAOgYIALgVIAHgRQBBieAuAAQAUAAANADQAMADAHAHQAHAHADAMQABAMAAASIAAAbIAAAQIAAAOIgCATIAaA5IAWA6IAKAcIARAxIAWA8IAVA6IAQAwIAJAaQAHAeAgBGIAIAPIAIAOQADAHAHAJIARAYQAlAzAAAYQABAOgGAMQgFAMgIAJQgKAJgNAFQgNAGgOAAQgOAAgNgJQgNgJgLgNQgNgOgLgRQgLgRgJgSIgRghIgLgaIgMgbQgGgNgGgTIgGgQIgDgJIgCgFIgCgGQgMAFgMABIgbABIgJACIgQAFIgRAGIgRAEIg5ANIg/AMIhDALIhFAMIgHACIgIAJIgOAUIgcAoQgVAegSAXQgTAVgQAQQgQAQgRAIQgSAIgTAAQgZAAgTgGgAAKgoQguBEgqBJIAjgCQARgBALgEIAagHIAYgGIAXgGIAegGIAwgMIAugNIgSg3IgTg5IgUg3QgLgbgMgXQgtA/gvBGg");
	this.shape_1.setTransform(872.5,200.125);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFFFFF").s().p("AkPGeQgRgGgLgLQgKgKgFgOQgFgOAAgOQAAgbAGgoIAPhSIAJgsIANhMIAPhcIAPheIAMhQIAGgyIAEgyIAEgsQACgUAFgQQAEgPAJgLQAJgMAPgFQAOgGAXAAQAVAAANAHQANAHAIALQAHAMADAOQADAPAAAOIgDAaIgJAxIgMBAIgOBJIgNBIIgLA/IgLA4QgHAfgGAfIgHAuIgIArIgFAmQgCARAAALIABAMQABAEADAAQAMAAASgDIApgJIAtgMIAqgNIASgDIAggHIAmgIIAngHIAggFIAUgCIAbgDQAUgDAcAAQArAAAUALQATALAAAaQAAALgDAMQgEAKgIAJQgFAIgJAGQgJAGgKAFIgTAGIgTABIhSAAQgZAAgeAFQgeAEgfAGQgfAHgeAIIg5APIhSAWQgnAJgcAAQgYAAgQgGg");
	this.shape_2.setTransform(793.275,201.875);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("Ak3CuQAAgXABgYQABgYAEgbQACgcAFggIALhGIAKg+QAEgeAHgcQAHgdAJgcQAJgbAMgdIgkAMIgmANIgMAEQgGACgHAAQgVAAgNgMQgNgLAAgTQAAgWAJgQQAJgSAVgNQAUgNAggJQAfgKAvgKQAagFAegFQAegFAggFIA7gGQAdgDAYAAIA4AAQAaABAaACIA1AGQAaAEAaAHQA8AOAkAdQArAhAAA2QAAAIgEAQIgLAhIgPAiQgJAQgHALQgTAagfAdQghAdgsAeQgpAbgrAbQgsAYgrAWQgxAZg3AYQg2AXg1ARIAAAaIABAWIACAlIACAsIADAuIADApIAAAfQAAAcgSAPQgRAQgdAAQhPAAAAkJgAgalFQg0AFgyAHQARARAAAbIgEASIgJAdIgJAfQgFAPgCADIgEASIgFAWIgGAaIgEAaIgFAeIgDAXIgBATIgCASIAogQIAvgUIAvgTIAmgTIAVgLIAZgNIAYgMIAWgOQAbgQAcgVQAcgWAXgYQAXgZAPgZQAPgZABgXQAAgLgcgHQgpgLgqgDQgsgDghAAQgrAAgxAGg");
	this.shape_3.setTransform(713,202.2);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AlGEJQgXgNgSgTQgRgUgLgZQgLgZAAgYQAAgsAMgpQALgoAUgkQATglAagkQAbglAcgjQASgVAVgUQAWgTAZgQQAXgPAZgJQAZgJAXAAQATgBAOAFQANAEAMAIQAMAIALAMIAVAZIAMANQAEAEAUAIQATAJAaAJQAbAIAdAHQAeAGAYAAIAugBQAVAAAXgEQAWgDAYgHQAYgIAdgNIAFANIABALQAAALgEALQgEAKgIALQgGAKgJAIQgKAIgJAHQgTANglAJQgmALg1gBQgOABgRgDQgSgCgRgEQgSgDgRgGQgRgGgQgHQADAFADAIIACASIABASIAAANQABAigMAiQgNAjgUAfQgUAggZAbQgZAagbAUQgVAQgaALQgaALgcAJQgcAHgeAEQgfADgfAAQgaAAgXgMgAiBicQgIAHgJALIgUAZIgTAYIgVAdIgUAbIgTAeIgTAiQgIARgFAaQgFAYAAAXQAAAJADAKQACAJAEAIQAFAIAHAEQAHAFAKAAQAZAAARgCQARgCAPgGQAOgHAPgKIAlgbQAJgHAKgKIATgXIATgXIARgZQAEgIAEgKIAFgUIADgVIAAgMIAAgBIgBgcQgCgPgEgMQgFgOgHgJQgHgKgNgDQgTgEgMgGQgMgGgHgFIgKgIIgDgEQgFABgIAHg");
	this.shape_4.setTransform(600.05,210.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FFFFFF").s().p("AijGsQgQgKgMgQQgMgQgFgUQgGgUAAgVQAAgkAFgrQAGgrAKgrIAKgqIAJgsIAIgkIAEgWIghADQgWADgdAAQgYAAgRgDQgRgDgLgIQgKgIgGgNQgEgOAAgXQAAgNAJgIQAJgIANgEQAOgEAPgBIAagCIATgBIAegDIAfgCIAXgCQADAAAEgKIAIgbIAJgkIAJgnIAIgkIAFgZQAGgXAFgdQADgcAJgZQAIgZAPgRQAPgSAcAAQAcAAAOANQAOANAAAdQAAAOgCASQgDATgGASQgMAqgKAlQgJAkgEAbIgJAqIgCAPIApAAIApgBIAtgDIAzgEQAfgEAVgEIAngHIAegGQAOgCAOAAQAIAAAHAFQAHADAAAQQAAAKgFAJQgEAIgGAHQgHAGgIAGIgPAKQgZALgbAIQgdAIgbAGIg2AJIgxAHIgfADIghAEIgcADIgYADIgWBYQgLAqgHAmIgEASIgEAZIgFAcIgEAdIgDAYIgCAPQABATAFAJQAGAHAGAFQALAJAIAIQAHAIAAAOQAAALgIAKQgHAJgMAHQgLAHgNAFQgNAEgLAAQgUAAgPgJg");
	this.shape_5.setTransform(546.45,204.125);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFFFFF").s().p("AlsGoQgKgDgEgHQgGgGgCgKQgBgLAAgOQgBgOADgRIAEgjIAGgjIAFggIADgRIAEgmIAGgzIAIg6IAIg5IAGgyIAEgkIACgQIAIhDIAIhFIAGhDQADggABgeQABgMAEgOQAEgOAJgLQAIgMAMgHQAMgIARAAQAWAAANAHQANAIAGAKQAGAKADALIABARIgCAbIgFAnIgHAtIgHArIgGAkIgFAVIgRBmIgLA5IgJAxIgFAiIgEAaIgEAXIAmguIAmgvIAmguIAfgnIAfgoQASgYAYgVQAVgWAZgOQAZgQAaAAQAPAAALAGQAKAFAGAJQAGAIADAJQACAKAAAIQAAANgMARQgNARgRASIgmAjIgjAgQgpAngeAgQgeAggaAeQAOAKAQAPIAjAgIAkAgQASARARAMIAfAVQAMAHALAEQAJADAKABIAUABQAQAAATgHQATgGATgLQAUgLAVgOQATgNAUgPIAigdIAdgZIAXgWQAJgIAMAAQAIAAAFAFQAFAFADAGIAFALIABAHQABAGgQAUQgPAUgZAbQgaAaghAeQghAdgjAZQglAZgjAQQgjAQggAAQgYAAgWgGQgVgGgRgKQgUgKgRgNQgTgNgQgPIghgfIgeggIgcgdQgOgOgMgJQgUAUgNAOQgMAPgIAMQgHAMgDANQgCALAAASQAAAZgDARQgCARgIAKQgGALgOAEQgNAEgVAAQgQAAgKgDg");
	this.shape_6.setTransform(440.05,198.875);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFFFFF").s().p("AkKESQgggPgVgZQgWgagKgiQgMghAAgnQAAhGAehHQAdhJA1hFQANgRASgUQARgTAUgPQATgPAVgKQAVgKATAAQANgBANAIQAMAHAMANQALAMAKARQALAQAIATQARAmAAARIgCAYQgCAMgEAMQgFAMgJAJQgIAJgOAAQgUAAgNgNQgOgNgIgRQgJgRgEgRQgGgQgEgGQgNAEgOAPQgQANgOAVQgOAVgMAaQgNAZgJAeQgJAcgGAeQgGAeAAAeQAAAcAUAVQAXAXAUAAQA9AAA6gXQA5gXA0gmQAlgaAmgfQAoggAvgsIAigfQAQgPASgMQAPgLAQgHQAPgHAMAAQAdAAAAAeQAAALgDAIQgDAHgGAJQgGAHgLAKIgYAXIgvAvIgbAZIgVAUIgXATIgcAWQgjAegiAaQgjAbggAUQgwAfg4ARQg4ARg/AAQgoAAgggPg");
	this.shape_7.setTransform(375.15,210.8);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#FFFFFF").s().p("AiwGhQgdgNgTgWQgUgWgNgcQgMgdgHggQgIgggDggQgCghAAgdIABgjQACgXADgZQADgZAEgXQADgXAEgOQAIgbAdgYQAcgWAjAAQAkAAAAAqQAAAUgEAXIgIArQgHAogDAgQgCAfAAAZQAAAbADAbQADAaAHAUQAGAUAJANQAKAMANAAQAQAAARgCQASgEAYgNQAugZA1gsIAqgkIAvgqIAsgsQAVgVAMgPIAFgHIAGgJQAEgEAFgDQAEgDAEAAQAJAAAEADQAEACAFAMQAGAOAAAJQAAANgJATQgKATgQAYQgRAYgXAbQgXAbgaAcQgdAfgiAeQgiAegmAbQgkAcglAPQgkAOghAAQgmAAgbgMgAijkbQgQgDgMgEQgNgFgIgIQgIgIAAgJQAAgRAJgTQAJgTAOgQQANgQARgKQAQgLAQAAQATAAAOADQAPACAKAGQAKAGAGALQAFALAAAQQAAASgFAQQgGAQgKAOQgVAdgrAAQgPAAgQgDg");
	this.shape_8.setTransform(321.375,197.325);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FFFFFF").s().p("AiWGNQgkgOgagdQgagdgOgsQgPgsgBg7QABgnADgpQAEgqAGgqQAFgqAIgpIAOhQIAIguIAHgpIAHgrIAJg2QADgQAGgNQAHgOAKgLQAKgLANgGQAOgGAQAAQAoAAASAlIgFAfQgFAbgIAjIgRBMQgJApgJAuQgJAtgHAvQgIAugEAuQgFAuAAArQAAAhAFAaQAFAbAKATQAKASARALQAPAKAXAAQAYAAAYgJQAYgKAZgPQAYgPAXgUQAYgUAVgTQAUgUAQgTIAbggIALgOQAFgIAJgGQAGgHAJgEQAIgEAKAAQAIAAAFAGQAGAGAAAMQgBANgFATQgHASgOAZQgPAZgZAfQgZAfgjAlQgVAUgZAUQgZAUgcAQQgdAPgdAKQgfAJgdAAQgpAAgigOg");
	this.shape_9.setTransform(269.85,196.075);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#FFFFFF").s().p("AktGcQgtgSgeghQgeghgOgtQgPgvAAg4QAAguALgxQALgxATgvQAUgwAagsQAagtAegmQARgVAYgYQAYgYAagWQAbgXAbgUQAbgUAZgPQARgKAbgMQAbgNAcgLQAdgMAcgHQAcgIAVAAQAlAAAWAFQAVAFARAMQAIAGALANQAKAMAJAPQAKAPAGAOQAHAOAAAKQAAAHgEALIgLAYIgPAbIgPAaIgQAXIgLAOQgYAdglAAQgfAAgRgRQgRgSAAgaQAAgIAJgRQAJgSAVgVQALgLAHgKQAIgKAEgHQgNgFgOAAQgRAAgZAIQgaAJgbANQgbAMgaAQQgaAQgSAOQgyApgsAzQgtAzgdA9QgMAXgKAbQgKAbgIAcQgIAcgEAcQgEAcAAAZQAAAcAGAXQAGAXAOASQANARAXAKQAWAKAhAAQAmAAArgLQAqgKArgSQArgTAsgXQArgYApgaQAogaAlgbQAkgbAdgYIAagVIAcgaIAcgcIAZgZIAUALQAHAEAEAFQADAFACAGIABAOQAAATgPAYQgPAYgZAaQgZAbghAcQghAcglAcQgyAmg4AjQg5Ajg6AbQg5Abg6AQQg5AQg0AAQg/AAgugRg");
	this.shape_10.setTransform(200.875,201.125);

	this.text = new cjs.Text("", "12px 'TimesNewRomanPSMT'", "#00FF33");
	this.text.lineHeight = 15;
	this.text.parent = this;
	this.text.setTransform(456.85,230.2);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#FFFFFF").s().p("Akqh5ICeAAIiekSIJVAAIifESICfAAIkrIFg");
	this.shape_11.setTransform(620.975,508.675);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.lf(["rgba(51,51,51,0.8)","rgba(51,51,51,0.11)"],[0,1],-5.5,0,5.5,0).s().p("AgmAnQgQgQAAgXQAAgVAQgRQAQgQAWAAQAXAAAQAQQAQARAAAVQAAAXgQAQQgQAQgXAAQgWAAgQgQg");
	this.shape_12.setTransform(363.475,453.225);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.text},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[]},1).wait(389));

	// 按鈕
	this.play_btn = new lib.隱形按鈕();
	this.play_btn.setTransform(621.9,598.4,0.287,0.2677,0,0,0,0.1,0.2);
	new cjs.ButtonHelper(this.play_btn, 0, 1, 2, false, new lib.隱形按鈕(), 3);

	this.stop_btn = new lib.隱形按鈕();
	this.stop_btn.setTransform(522.3,598.4,0.287,0.2677,0,0,0,0.1,0.2);
	new cjs.ButtonHelper(this.stop_btn, 0, 1, 2, false, new lib.隱形按鈕(), 3);

	this.instance = new lib.按鈕元件();
	this.instance.setTransform(576.85,593.8,0.8038,0.8038,0,0,0,142,56.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance},{t:this.stop_btn},{t:this.play_btn}]}).to({state:[{t:this.instance},{t:this.stop_btn},{t:this.play_btn}]},389).wait(1));

	// 紅魚
	this.instance_1 = new lib.紅魚群();
	this.instance_1.setTransform(-296.15,459.05,0.5959,0.607,0,0,0,-10.1,-8.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({x:560.45,y:222.75},169).to({x:1430.9,y:504.35},186).wait(35));

	// 熱帶魚
	this.instance_2 = new lib.熱帶魚元件();
	this.instance_2.setTransform(-58.1,346.3,0.5299,0.5299,0,0,0,109.2,115.1);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(118).to({x:-72.1,y:347.95},0).to({guide:{path:[-72,348,-60,348.9,-49.3,348.9,-15.6,348.9,19.5,325.7,33.5,316.3,50.1,301.8,60.4,292.8,79.6,274.5,99.5,255.5,108.9,247.1,125.4,232.6,139,223.3,173.3,200,205.7,200,232.9,200,254.2,214.3,262.4,219.8,272,228.9,273.2,230,288.9,245.7,310.7,267.6,329.2,277.1,356.8,291.4,394.6,291.4,427,291.4,445.6,287.5,465.6,283.2,483.2,271.8,498.8,261.8,523.3,238.8,538.8,224.2,581.5,182.5,629.3,136.9,661.1,116.2,712.7,82.6,760.3,82.6,771.8,82.6,803.7,93.9,808.1,95.4,869.7,118.9,914.1,135.7,941.4,143.8,979.8,155.1,1002.3,155.1,1034.6,155.1,1067.6,151.3,1085.5,149.3,1122.3,143.3,1155.4,138,1174.4,136.2,1188,134.9,1201.3,134.6], orient:'fixed'}},271).wait(1));

	// 尼斯
	this.instance_3 = new lib.尼斯游泳();
	this.instance_3.setTransform(1869.55,658.4,0.6702,0.6702,0,0,0,-110.1,-152.7);

	this.nswim_mc = new lib.尼斯游泳();
	this.nswim_mc.setTransform(1869.55,658.4,0.6702,0.6702,0,0,0,-110.1,-152.7);
	this.nswim_mc._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_3}]}).to({state:[{t:this.nswim_mc}]},44).to({state:[{t:this.nswim_mc}]},345).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.nswim_mc).wait(44).to({_off:false},0).to({x:-649.2,y:-325.8},345).wait(1));

	// 影子
	this.instance_4 = new lib.影子();
	this.instance_4.setTransform(1544.2,594.45,1,1,0,0,0,312.8,79);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(78).to({x:1276.85,y:650.85},34).to({x:1048,y:621.5},33).to({regX:312.9,scaleX:1.3994,x:970.25,y:594.45},41).to({regX:312.8,scaleX:1.4354,x:811.75,y:579.45},29).to({scaleX:1.6719,x:406.1,y:464.2},55).to({scaleX:1.8656,x:12.4,y:368.2},36).to({scaleX:2.181,x:-595.9,y:320.3},83).wait(1));

	// 小丑魚
	this.instance_5 = new lib.小丑魚元件();
	this.instance_5.setTransform(1209.35,559.1,1,1,0,0,0,61.1,33.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_5).to({rotation:12.1618,guide:{path:[1209.3,559.1,1202.1,559.6,1194.1,559.9,1179.2,560.5,1164.6,560.3,1114.4,559,1110.9,558.9,1087.4,558.6,1073.9,556.5,1057.7,554.1,1048.9,548.5,1039.4,542.4,1036.7,531.5,1033.5,514.6,1031.6,506.3,1028.1,491.6,1021.7,481.4,1015.2,470.9,1002.8,461.8,996.5,457.4,993.8,455.3,989.1,451.8,986.7,448.9,952.2,406,909.6,390.4,886.3,381.8,864,377.6], orient:'fixed'}},60).to({regX:61.2,regY:33.7,scaleX:0.9999,scaleY:0.9999,rotation:1.5058,guide:{path:[863.9,377.5,862,377.2,860.1,376.9], orient:'fixed'}},6).to({regX:61.3,regY:33.8,rotation:2.8052,guide:{path:[860.2,376.9,860.5,376.9,860.7,376.9], orient:'fixed'}},5).to({regX:61.4,rotation:4.2867,guide:{path:[860.7,376.9,859,376.6,857.2,376.4], orient:'fixed'}},6).to({regY:33.9,rotation:-1.24,guide:{path:[857.1,376.4,858.2,376.5,859.2,376.7], orient:'fixed'}},6).to({regY:33.8,scaleX:0.9998,scaleY:0.9998,rotation:7.2226,guide:{path:[859.2,376.8,860.1,376.9,860.9,377.1], orient:'fixed'}},6).to({regX:61.5,rotation:2.3127,guide:{path:[860.9,377,861.1,377.1,861.3,377.1], orient:'fixed'}},8).to({rotation:9.096,guide:{path:[861.3,377.1,859.8,376.8,858.2,376.6], orient:'fixed'}},7).to({regX:61.1,regY:33.6,scaleX:0.9999,scaleY:0.9999,rotation:-22.9419,guide:{path:[858.2,376.6,842.7,374,827.7,373.5,788.4,372.3,781.2,372.1,773.9,371.8,757.6,373.5,741.4,375.2,696.5,378.9,691.7,379.3,646.6,383.4,610.7,386.6,594,387.7,546.1,390.7,482,401.5,423.1,411.4,366.5,425.2,334.5,432.8,319,436.5,292.1,443.1,273.5,448.5,223.7,462.9,190.1,481.4,139.7,509.1,109.2,519.2,100.7,521.9,91.9,524.1], orient:'fixed'}},187).to({regY:33.7,rotation:-29.2747,guide:{path:[91.9,524.1,84.1,526,76,527.5], orient:'fixed'}},5).to({regX:61,regY:33.8,scaleX:0.9998,scaleY:0.9998,rotation:-2.555,guide:{path:[76,527.5,76.6,527.3,77.3,527.2], orient:'fixed'}},6).to({rotation:-14.4767,guide:{path:[77.3,527.2,72.6,528,67.8,528.7], orient:'fixed'}},6).to({rotation:-5.6554,guide:{path:[67.7,528.7,65.3,529,62.8,529.3], orient:'fixed'}},5).to({regY:33.6,guide:{path:[62.9,529.3,45.2,531.5,26.3,531.5,-25.8,529,-63.8,527], orient:'fixed'}},76).wait(1));

	// 魟魚
	this.instance_6 = new lib.魟魚元件();
	this.instance_6.setTransform(-135.8,567.85,1,1,-14.9992,0,0,206.5,111);

	this.timeline.addTween(cjs.Tween.get(this.instance_6).to({rotation:-8.7336,x:98.65,y:460.75},23).to({rotation:7.2151,x:231.35,y:529},36).to({regX:206.6,rotation:5.4839,x:231.45,y:529.05},3).to({rotation:-1.2634},3).to({rotation:3.2138,x:249.2},3).to({regX:206.7,rotation:-4.7301,x:255.75,y:530.15},3).to({rotation:-0.0341,y:530.2},3).to({rotation:-0.0341},48).to({regX:206.5,rotation:0,x:390.85,y:478.75},47).to({regX:206.7,rotation:10.454,x:767.05,y:524.75},69).to({regX:206.6,regY:111.2,rotation:-44.723,x:1355.25,y:362.15},151).wait(1));

	// 紫魚
	this.instance_7 = new lib.紫魚群();
	this.instance_7.setTransform(1371.5,177.9,0.5433,0.5433,0,0,0,116.8,-52);

	this.timeline.addTween(cjs.Tween.get(this.instance_7).to({x:580.05,y:413.5},97).to({x:-232.9,y:208.15},152).wait(141));

	// bubbles
	this.instance_8 = new lib.一串泡泡();
	this.instance_8.setTransform(886,534.5,0.5959,0.5959,0,0,0,31.4,-85.9);

	this.instance_9 = new lib.一串泡泡();
	this.instance_9.setTransform(1031.95,188.35,0.5306,0.5306,0,0,180,31.4,-85.8);

	this.instance_10 = new lib.一串泡泡();
	this.instance_10.setTransform(257.8,483.2,0.5959,0.5959,0,0,0,31.4,-85.8);

	this.instance_11 = new lib.一串泡泡();
	this.instance_11.setTransform(38.05,413.7,1.082,1.082,0,0,180,31.4,-85.8);

	this.instance_12 = new lib.一串泡泡();
	this.instance_12.setTransform(537.65,474.8,0.4305,0.4305,0,0,180,31.4,-85.7);

	this.instance_13 = new lib.一串泡泡();
	this.instance_13.setTransform(1092.75,416.75,1.0671,1.0671,0,0,0,31.4,-85.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_13},{t:this.instance_12},{t:this.instance_11},{t:this.instance_10},{t:this.instance_9},{t:this.instance_8}]}).to({state:[{t:this.instance_13},{t:this.instance_12},{t:this.instance_11},{t:this.instance_10},{t:this.instance_9},{t:this.instance_8}]},389).wait(1));

	// 背景
	this.instance_14 = new lib.海底世界背景();
	this.instance_14.setTransform(0,0,0.8325,0.8333);

	this.timeline.addTween(cjs.Tween.get(this.instance_14).wait(390));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-881.8,-527,3552.8,1706.6);
// library properties:
lib.properties = {
	id: '829CDF90E964E84CAFCABDF95392D789',
	width: 1138,
	height: 640,
	fps: 24,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"images/紅魚_.png", id:"紅魚"},
		{src:"images/按鈕_.png", id:"按鈕"},
		{src:"images/小丑魚_.png", id:"小丑魚"},
		{src:"images/紫魚_.png", id:"紫魚"},
		{src:"images/水怪01.png", id:"水怪01"},
		{src:"images/水怪02.png", id:"水怪02"},
		{src:"images/水怪03.png", id:"水怪03"},
		{src:"images/水怪04.png", id:"水怪04"},
		{src:"images/水怪05.png", id:"水怪05"},
		{src:"images/魟魚_.png", id:"魟魚"},
		{src:"images/海底世界背景_.jpg", id:"海底世界背景"},
		{src:"images/泡泡_.png", id:"泡泡"},
		{src:"images/熱帶魚_.png", id:"熱帶魚"},
		{src:"images/點陣圖1.png", id:"點陣圖1"}
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
an.compositions['829CDF90E964E84CAFCABDF95392D789'] = {
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