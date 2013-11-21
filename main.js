

// 查找id
function $(str) {
	return document.getElementById(str);
}
//查找标签
function $tag(str,target) {
	target = target || document;
	return target.getElementsByTagName(str);
}
//添加事件
function addEventHandler(obj,eType,fuc){
	if(obj.addEventListener){ 
		obj.addEventListener(eType,fuc,false); 
	}else if(obj.attachEvent){ 
		obj.attachEvent("on" + eType,fuc); 
	}else{ 
		obj["on" + eType] = fuc; 
	} 
} 
//移除事件
function removeEventHandler(obj,eType,fuc){
	if(obj.removeEventListener){ 
		obj.removeEventListener(eType,fuc,false); 
	}else if(obj.attachEvent){ 
		obj.detachEvent("on" + eType,fuc); 
	} 
}
//返回随机数
function randowNum(start,end) {
	return Math.floor(Math.random()*(end - start)) + start;
}
//移除数组中指定下标项
Array.prototype.remove=function(dx) {
	if(isNaN(dx)||dx>this.length){return false;}
	for(var i=0,n=0;i<this.length;i++){
		if(this[i]!=this[dx]){
			this[n++]=this[i]
		}
	}
	this.length-=1
}
//设置样式
function setStyle() {
	if(arguments.length == 2 &&  typeof arguments[1] == "object") {
		for(var key in arguments[1]) {
			arguments[0].style[key] = arguments[1][key];
		}
	} else if (arguments.length > 2) {
		arguments[0].style[arguments[1]] = arguments[2];
	}
}
//目标元素在reference中的相对位置
function getElemPos(target,reference) {
	reference = reference || document;//默认值为document
	var left = 0,top = 0;
	return getPos(target);
	function getPos(target) {
		if(target != reference) {
			left += target.offsetLeft;
			top += target.offsetTop;
			return getPos(target.parentNode);
		} else {
			return [left,top];
		}
	}
}
//为对象设置坐标
function setPos(obj,x,y) {
	obj.style.left = x + "px";
	obj.style.top = y + "px";
}
//隐藏对象
function hide(obj) {
	setStyle(obj,"display","none");
}
//显示对象
function show(obj) {
	setStyle(obj,"display","block");
}
//设置隐藏效果
function fadeIn(obj){
	var fromY = 230,
		posStep = [8,14,19,23,26,28,29,29,30,30,30],
		opaStep = [0,0.05,0.1,0.15,0.2,0.25,0.3,0.4,0.5,0.6,0.8],
		fromOpa = 0,
		t = 0,
		step = posStep.length,
		inTimer = window.setInterval(showIn,20),
		outTimer;
	
	function showIn() {
		setOpacity(obj,opaStep[t]);
		obj.style.top = fromY + posStep[t] + "px";
		t++;
		if(t>=step) {
			window.clearInterval(inTimer);
			outTimer = window.setInterval(fadeOut,50);
		}	
	}
	
	function fadeOut() {
		t--;
		setOpacity(obj,opaStep[t]);
		obj.style.top = fromY + posStep[t] + "px";
		if(t <= 0) {
			window.clearInterval(outTimer);
			hide(obj);
		}
	}	
}
//设置透明度
function setOpacity(obj,n) {
	obj.style.cssText = "filter:alpha(opacity="+ n*100 +"); -moz-opacity:"+ n +"; opacity:"+ n;
}
//声明一些初始化变量
var TOTALR = 15, //球的半径(包括阴影)
	R = 12, //球真实半径
	POKER = 20,//入袋口的大小，越小球约难进
	W = 736, //案宽
	H = 480, //案高
	THICKNESS =  32, //边缘厚度
	RATE = 100, //刷新频率
	F = 0.02, //摩擦力
	LOSS = 0.3; // 碰撞速度损失
	
var table, //案子
	cueBall, //母球
	guideBall, //参考球
	dotWrap, //参考线
	speed = 12,
	rollUp = 0,
	rollRight = 0,
	timer,
	forceTimer,
	balls = [],
	movingBalls = [],
	pokes = [[0,0],[W/2,-5],[W,0],[0,H],[W/2,H+5],[W,H]],//6个球洞的参数
	hasShot = false;
	shots = 0; //连击次数

//页面加载完毕后开始执行
window.onload = function() {
	initTable();//初始化球运动区域和瞄准球
	startGame();
}
//初始化球运动区域和瞄准球
function initTable() {
	table = $("table");//整个桌面
	var dotWrapDiv = document.createElement("div"),
		guideBallDiv = document.createElement("div");
	dotWrapDiv.id = "dotWrap";//球运动区域
	guideBallDiv.className = "guide ball"; //瞄准的虚线球
	setStyle(guideBallDiv,"display","none");//瞄准球添加样式
	dotWrap = table.appendChild(dotWrapDiv);//将创建的dom添加到页面中,并且返回新的子节点
	guideBall = table.appendChild(guideBallDiv);
}

//开始游戏
function startGame() {
	initBall();//初始化所有的球
	addEventHandler(table,"mousemove",dragCueBall);//绑定鼠标移动事件，给球设置坐标
	addEventHandler(table,"mouseup",setCueBall);//移除table上绑定事件并且开始执行startShot()函数
}
//初始化母球和目标球，并且放入数组并且显示在桌面上
function initBall() {
	//添加母球
	cueBall = new Ball("cue",170,H/2);//为母球设置坐标，H = 480, 案高
	//alert("只能看的一个母球在线中间");//这里设置断点，可只看的一个母球
	balls.push(cueBall);//将母球放入数组	
	//添加目标球
	for(var i = 0; i < 5; i++) {
		for(var j = 0; j <= i; j++)	{
			var ball = new Ball("target",520 + i*2*R, H/2 - R*i + j*2*R);
			//添加目标球，R = 12, 球真实半径，H = 480, 案高
			balls.push(ball);//将球放入数组
			//alert("目标球依次初始化");//设置断点可以看的目标球一次初始化
		}
	}
}
// ball class构造函数，给球设置属性	
function Ball(type,x,y) {
	var div = document.createElement("div");
	div.className = type + " ball";//球的类名
	this.elem = table.appendChild(div);//桌面上面添加球，返回添加的子元素
	this.type = type;
	this.x = x; //位置
	this.y = y;
	this.angle = 0; //角度
	this.v = 0; //速度(不包含方向)
	setBallPos(this.elem,x,y);//为球设置坐标
	return this;
}
//给球设置坐标
function setBallPos(ball,x,y) {
	if(ball.constructor == Ball) {//如果ball是Ball构造函数这个对象
		ball.x = x;
		ball.y = y;
		ball = ball.elem;
	}
	setPos(ball,x + THICKNESS - TOTALR,y + THICKNESS - TOTALR);//为求设置坐标，TOTALR = 15, 球的半径(包括阴影)THICKNESS =  32,边缘厚度
}
//移动鼠 标时，给母球重新设置位置
function dragCueBall(e) {
	var toX,toY;
	e = e || event;
	toX = e.clientX - table.offsetLeft - THICKNESS,
	toY = e.clientY - table.offsetTop - THICKNESS;
	//toX,toY在桌面上的坐标
	toX = toX >= R ? toX : R;//x坐标小于球的半径，则球靠近左边台子
	toX = toX <= 170 ? toX : 170;//x坐标不能超过球线
	toY = toY >= R ? toY : R;//y坐标小于半径，则靠近上边台子
	toY = toY <= H - R ? toY : H - R;//坐标超出下面台子，则球靠近下边台子
	setBallPos(cueBall,toX,toY);//给目球设置坐标
}
//放开鼠标时，table上面绑定的事件，并且开始执行startShot()函数
function setCueBall() {
	removeEventHandler(table,"mousemove",dragCueBall);
	removeEventHandler(table,"mouseup",setCueBall);
	startShot();
}
//开始击球
function startShot() {
	show(cueBall.elem);//显示母球
	addEventHandler(table,"mousemove",showGuide);//移动是添加事件，显示瞄准球和参考线
	addEventHandler(table,"mouseup",shotCueBall);//放开鼠标绑定事件
}
//显示瞄准球，并且显示参考线
function showGuide(e) {
	var fromX,fromY,toX,toY;
	e = e || event;
	toX = e.clientX - table.offsetLeft - THICKNESS,
	toY = e.clientY - table.offsetTop - THICKNESS;
	//鼠标在table上面的坐标
	setBallPos(guideBall,toX,toY);//显示瞄准求的位置
	show(dotWrap);//显示球运动区域,在css中将#dotWrap设置一个背景色background:pink;会很好看的这个运动区域的作用
	show(guideBall);//显示瞄准球
	drawLine();//画参考线
	//参考线
	function drawLine() {
		var dotNum = 16,//数字越大，参考线约密集
			pos = getBallPos(cueBall.elem);//获得母球在table上面的坐标
		dotWrap.innerHTML = "";
		fromX = pos[0];
		fromY = pos[1];//fromX和fromY是母球的坐标
		var partX = (toX - fromX) / dotNum,//（鼠标的横坐标-母球的横坐标）/16
			partY = (toY - fromY) / dotNum;//（鼠标的纵坐标-母球的纵坐标）/16
		for(var i = 1; i < dotNum; i++) {//设置构成参考线的小点
			var x = fromX + partX * i,
				y = fromY + partY * i;
			drawDot(dotWrap, x, y);//绘制参考点到球运动区域
		}		
	}
}
//获得球在table上面的坐标
function getBallPos(obj) {
	var pos = [];
	pos.push(obj.offsetLeft - THICKNESS + TOTALR);
	pos.push(obj.offsetTop - THICKNESS + TOTALR);
	//alert(pos[0]+":"+pos[1]);
	return pos;
}
//绘制参考点
function drawDot(wrap,x,y) {
	var elem = document.createElement("div");
	setStyle(elem,{
		position: "absolute",
		width: "1px",
		height: "1px",
		fontSize: "1px",
		background: "white"
	});
	setPos(elem,x,y);//为新创建的对象添加坐标
	wrap.appendChild(elem);
}

//移除startShot()绑定的事件，处理圆盘中小蓝点数据，处理母球和瞄准求直接的数据，设置定时执行roll函数
function shotCueBall() {
	//removeEventHandler(table,"mousemove",showGuide);//移除移动鼠标显示瞄准球事件
	//removeEventHandler(table,"mouseup",shotCueBall);//此处松开鼠标事件
	speed = 100* 0.15;//获取力量槽的width（其实就是updateForce中的len值）*0.15 作为运动速度
	//计算圆盘中蓝点的数据
	var dotDisX = 0,//圆盘中小蓝点在圆盘中的x轴距离-22
		dotDisY =0,//小蓝点y轴-22
		dotDis = Math.sqrt(dotDisX*dotDisX + dotDisY*dotDisY),//开根号，dotDis举例圆盘中心的举例
		dotAngle = Math.atan2(dotDisX,dotDisY);//算出角度
	rollRight = Math.round(dotDis*Math.sin(dotAngle))/5;//舍入为最接近的整数
	rollUp = -Math.round(dotDis*Math.cos(dotAngle))/5;
	//alert(rollRight+":"+rollUp),果不去修改蓝点，rollRight和rollUp一直是0
	var formPos = getBallPos(cueBall.elem),//母球在table上的坐标
		toPos = getBallPos(guideBall),//瞄准球在table上的坐标
		angle = Math.atan2(toPos[0] - formPos[0],toPos[1] - formPos[1]);
		//atan2() 方法可返回从 x 轴到点 (x,y) 之间的角度。
	hide(dotWrap);//隐藏球运动区域，区域上面的参考线同时隐藏
	hide(guideBall);//隐藏瞄准球
	cueBall.v = speed;//设置母球的速度
	cueBall.angle = angle;//设置母球的运动角度
	movingBalls.push(cueBall);//将母球添加到移动球数组

	timer = window.setInterval(roll,1000 / RATE);//RATE = 100, 刷新频率,定时执行roll函数
}
//处理每次刷新是移动中的球的情况
function roll() {
	//处理球停止运动的情况
	if(movingBalls.length <= 0) {//如果movingBalls数组中没有球，球都停止移动了
		if(!hasShot){
			shots = 0;
		}else{
			shots ++; //累计连击
		}
		hasShot = false;
		window.clearInterval(timer);//停止运行不断运行的roll函数
	}
	//处理移动中的球
	for(var i = 0; i < movingBalls.length; i++) {
		//记录移动中的球的sin和cos
		var ball = movingBalls[i],
			sin = Math.sin(ball.angle),
			cos = Math.cos(ball.angle);
		//速度在每次setInterval中不断递减
		ball.v -= F;//ball.v母球的速度,F = 0.02, 摩擦力,每次执行roll()，速度减少0.02
		//移除静止的小球
		if(Math.round(ball.v) == 0) {//如果速度接近0
			ball.v = 0;
			movingBalls.remove(i);//将停止的球移除移动球数组
			continue;	//从新执行循环
		}
		//运动的球每次刷新后的坐标
		var vx = ball.v * sin,//x轴方向的	速度
			vy = ball.v * cos;//y轴方向的速度
		ball.x += vx;
		//vx速度在10毫秒的刷新频率下，转化为每次刷新的举例，并且随着时间，vx速度递减，每次刷新运动的举例也递减
		ball.y += vy;	
		//入袋后的处理
		
		if(ball.x < R || ball.x > W - R) {//R = 12球真实半径,W = 736 案宽,球移动到左边缘或者右边缘
			ball.angle *= -1;//角度相反
			ball.angle %= Math.PI;//Math.PI圆周率，这一步没有改变ball.angle的值
			ball.v = ball.v * (1 - LOSS);//LOSS = 0.3 碰撞速度损失
			vx = ball.v*Math.sin(ball.angle);//碰撞后每次刷新运动的x轴运动的距离
			vy = ball.v*Math.cos(ball.angle);
			if(ball.x < R) ball.x = R;//如果坐标小于半径，则贴着左边缘
			if(ball.x > W - R) ball.x = W - R;//贴着右边缘
			//母球加塞（这里我还特意查了什么叫加塞，个人通俗的理解，加塞就是打的旋球，这里处理的情况就是母球选择碰到边缘后不仅会角度反向，而且反向后会有一个弧度）
			if(ball.type == "cue"){//如果碰撞的球是母球
				if(ball.angle > 0){
					vy -= rollRight;//小蓝点在中心的话，rollRight==0
				}else{
					vy += rollRight;//会改变y轴每次刷新移动的距离
				}
				vx += rollUp;//改变x轴每次刷新移动的距离
				rollUp *= 0.2;//每一次碰撞加塞的rollUp，rollRight会衰减
				rollRight *= 0.2;
				ball.v = Math.sqrt(vx*vx + vy*vy);//ball.v移动的速度
				ball.angle = Math.atan2(vx,vy);//移动的角度
			}				
		}
		if(ball.y < R || ball.y > H - R) {//碰撞上边缘或者下边缘
			ball.angle = ball.angle > 0 ? Math.PI - ball.angle : - Math.PI - ball.angle ;
			//改版碰撞后的角度，和x轴算法不同
			ball.angle %= Math.PI;
			ball.v = ball.v * (1 - LOSS);//碰撞后速度损失
			vx = ball.v*Math.sin(ball.angle);
			vy = ball.v*Math.cos(ball.angle);
			if(ball.y < R) ball.y = R;//贴着下边缘
			if(ball.y > H - R) ball.y = H - R;//贴着上边缘	
			//母球加塞
			if(ball.type == "cue"){
				if(Math.abs(ball.angle) < Math.PI/2){
					vx += rollRight;//这里加塞后对x轴产生影响
				}else{
					vx -= rollRight;
				} 
				vy += rollUp;
				rollUp *= 0.2;//碰撞衰减
				rollRight *= 0.2;
				ball.v = Math.sqrt(vx*vx + vy*vy);
				ball.angle = Math.atan2(vx,vy);
			}					
		}
		//小球碰撞
		for(var j = 0; j < balls.length; j++) {//进入袋中的球从balls中已经删除，这里遍历存在的球
			var obj = balls[j];
			if(obj == ball){//如果这个球是自身，则推出当前循环再次继续遍历
				continue;
			}
			var disX = obj.x - ball.x,
				disY = obj.y - ball.y,//disX，两球见x轴距离，disY，两球间y轴距离
				gap = 2 * R;//R是半径，gap则是直径
			//运动的这个球和其他所有球比较，如果disX，disY同时小于直径，则可以说明两球可能发生碰撞
			if(disX <= gap && disY <= gap) {
				var dis = Math.sqrt(Math.pow(disX,2)+Math.pow(disY,2));//两球间的距离
				if(dis <= gap) {
					//如果被撞击的球是静止的，则添加到数组movingBalls
					if(Math.round(obj.v) == 0){
						movingBalls.push(obj);
					}

					//-------------------下面部分是一系列复制的碰撞角度运算-----------------原来代码中注释

					//将坐标旋转到x轴进行碰撞计算
					// 计算角度和正余弦值 - 精确值
					//var c = (obj.x*ball.y - obj.y*ball.x)/(2*R),
					//	d = Math.sqrt(ball.x*ball.x + ball.y*ball.y),
					//	angle = Math.asin(ball.y/d) - Math.asin(c/d) - ball.angle%(Math.PI/2),
					//angle =  Math.asin(oy / (2 * R)),
					
					//还原两球相切状态 - 近似值
					ball.x -= (gap - dis)*sin;
					ball.y -= (gap - dis)*cos;
					disX = obj.x - ball.x;
					disY = obj.y - ball.y;
					
					// 计算角度和正余弦值
					var angle = Math.atan2(disY, disX),
						hitsin = Math.sin(angle),
						hitcos = Math.cos(angle),
						objVx = obj.v * Math.sin(obj.angle),
						objVy = obj.v * Math.cos(obj.angle);
						//trace(angle*180/Math.PI);
						
					// 旋转坐标
					var x1 = 0,
						y1 = 0,
						x2 = disX * hitcos + disY * hitsin,
						y2 = disY * hitcos - disX * hitsin,
						vx1 = vx * hitcos + vy * hitsin,
						vy1 = vy * hitcos - vx * hitsin,
						vx2 = objVx * hitcos + objVy * hitsin,
						vy2 = objVy * hitcos - objVx * hitsin;
					
					// 碰撞后的速度和位置
					var plusVx = vx1 - vx2;
					vx1 = vx2;
					vx2 = plusVx + vx1;
					
					//母球加塞
					if(ball.type == "cue")	{
						vx1 += rollUp;
						rollUp *= 0.2;
					}				
					
					x1 += vx1;
					x2 += vx2;
					
					// 将位置旋转回来
					var x1Final = x1 * hitcos - y1 * hitsin,
						y1Final = y1 * hitcos + x1 * hitsin,
						x2Final = x2 * hitcos - y2 * hitsin,
						y2Final = y2 * hitcos + x2 * hitsin;
					obj.x = ball.x + x2Final;
					obj.y = ball.y + y2Final;
					ball.x = ball.x + x1Final;
					ball.y = ball.y + y1Final;
					
					// 将速度旋转回来
					vx = vx1 * hitcos - vy1 * hitsin;
					vy = vy1 * hitcos + vx1 * hitsin;
					objVx = vx2 * hitcos - vy2 * hitsin;
					objVy = vy2 * hitcos + vx2 * hitsin; 
					
					//最终速度
					ball.v = Math.sqrt(vx*vx + vy*vy) * (1 - 0);
					obj.v = Math.sqrt(objVx*objVx + objVy*objVy) * (1 - 0);
					
					// 计算角度
					ball.angle = Math.atan2(vx , vy);
					obj.angle = Math.atan2(objVx , objVy);
					//break;
					//------------------------------------复杂的计算结束----	
				}
			}
		}
		setBallPos(ball,ball.x,ball.y);//每次setInterval后设置移动球的位置
	}
}
