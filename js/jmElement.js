
/**
 * 流程编辑器单元,继承自jmControl
 * 参数说明:resizable=是否可改变大小，connectable=是否可连线,value =当前显示字符串,position=单元位置,editor=当前单元所属编辑器,graph=画布,style=样式对象或名称
 * 
 * @class jmDraw
 * @for jmDraw
 * @module jmDraw
 * @param {object} option 参数
 */

jmDraw.jmElement = function(option) {	

	if(option) this.init(option);

	this.type = this.type||'jmElement';
}

/**
 * 初始化组件
 *
 */
jmDraw.jmElement.prototype.init = function(option) {
	//继承属性绑定
	jmUtils.extend(this, new jmControl(option.graph, option));

	this.option = option;			
	
	this.text(option.text || '');
	this.graph = option.graph;
	this.editor = option.editor;		
	//this.styleName = option.styleName;	
	//初始化为默认样式
	this.style = this.style||option.style||jmUtils.clone(this.editor.defaultStyle.cell);		
	this.setStyleName(this.styleName);
	option.position = option.position || {x:0,y:0};

	//如果从样式中取大小，则重新定位
	if(option.width) {
		this.width = option.width;
	}
	else if(this.style.width) {
		this.width = this.style.width;
		option.position.x -= this.style.width / 2;
	}
	if(option.height) {
		this.height = option.height;
	}
	else if(this.style.height) {
		this.height = this.style.height;
		option.position.y -= this.style.height / 2;
	}
	this.position = option.position;	

	/**
	 * 当前元素是否已被选择
	 *
	 * @property selected
	 * @type boolean
	 */
	this.selected = false;
	this.initializing(this.graph.context,this.style);
	//已option参数为准
	if(typeof option.resizable != 'undefined') {
		this.resizable = option.resizable;
	}
	else if(typeof this.style.resizable != 'undefined') {
		this.resizable = this.style.resizable;			
	}
	
	if(typeof option.connectable != 'undefined') {
		this.connectable = option.connectable;
	}
	else if(typeof this.style.connectable != 'undefined') {
		this.connectable = this.style.connectable;			
	}	
	else {
		this.connectable = this.editor.connectable;
	}	

	this.create();
}

/**
 * 初始化当前元素样式
 *
 * @method setStyleName
 * @for jmElement
 * @param {object} style 样式
 */
jmDraw.jmElement.prototype.setStyleName = function(style) {
	if(style) {
		var mpstyle = this.editor.styles[style]
		 if(mpstyle) {
		 	this.styleName = style;
		 	if(typeof this.style == 'object') {
		 		this.style = jmUtils.extend(this.style, mpstyle);
		 	}
		 	else {
			 	this.style = jmUtils.clone(mpstyle, true);
			 }
		 }
		 else {
		 	//如果设置为一个对象，则把属性继承过来即可
		 	if(typeof this.style == 'object') {
		 		if(typeof style == 'object') {
		 			this.style = jmUtils.extend(this.style, style);
		 		}
		 	}
		 	else {
			 	this.style = jmUtils.clone(style, true);
			}
		 	mpstyle = style;
		 }
		if(typeof this.style.resizable != 'undefined') {
			this.resizable = this.style.resizable;	
		}
		this.style.zIndex = this.style.zIndex || 1000;
		this.style.padding = this.style.padding || {left:8,top:8,right:8,bottom:8};
		if(this.label) {
			this.label.style = this.style.label;
		}
		if(this.shape) {
			mpstyle.zIndex = 0;
			this.shape.style = mpstyle;
		}
	}
}

/**
 * 生成节点元素
 * 并生成基础子控件,包括图形，边界，拖放标识和连线等
 *
 * @method create
 * @for jmElement
 * @private
 */
jmDraw.jmElement.prototype.create = function() {
	this.connects = new jmUtils.list();
	var w = this.width;
	var h = this.height;
	this.center = {x:w / 2,y:h / 2};
	var borderStyle;
	
	if(this.style && this.style.resize) {
		this.rect = this.graph.createShape('resize',{
					width:w,
					height:h,
					rectSize: 6,//拖放的小方块大小
					movable:false,
					resizable: this.resizable,
					style: this.editor.defaultStyle.cell.resize});

		this.rect.visible = false;
	}
	
	if(!this.shape) {	
		var shapeName = this.option.shapeName || this.style.shapeName || 'rect';
		var params = jmUtils.extend({
			style: this.style.shape,
			width:'100%',
			height:'100%',
			center: this.center,
			position:{x:0,y:0}
		}, this.option);
		this.shape = this.graph.createShape(shapeName, params);	
	}

	/*if(this.connectable) {
		//创建连线拉动点
		var centerArcSzie = 8;
		var bg = this.graph.createRadialGradient(centerArcSzie / 2,centerArcSzie / 2,0,centerArcSzie / 2,centerArcSzie / 2,centerArcSzie);
			bg.addStop(0,'#00FF00');
			bg.addStop(1,'#059505');		
		//连接拖动圆点
		this.connArc = this.graph.createShape('arc',{
			center:{x:'50%',y:'50%'},			
			width:centerArcSzie,
			height:centerArcSzie,
			radius:centerArcSzie,
			style:{
				fill:bg,
				close:true,
				zIndex:200
			}});
		this.connArc.visible = false;	
		//带箭头的连线，用来拖动连接对象
		this.connectLine = this.graph.createShape('arrawline',{
			start:this.center,
			end:this.connArc.center(),
			offsetX: 6,
			offsetY: 12,
			style:this.editor.defaultStyle.dragLine
		});

		this.connectLine.visible = false;	
		this.children.add(this.connectLine);
	}*/
	
	//当前节点字符串为示控件
	this.label = this.graph.createShape('label',{
		style: this.style.label,
		width:'100%',
		height:'100%',
		text : this.text()
	});
	this.setStyleName(this.styleName);
}

/**
 * 生成对应的连接点
 */
jmDraw.jmElement.prototype.createConnectPoints = function() {
	this.connectPoints = [];
	//左边的连接点
	this.connectPoints.push(this.connectLeft=new this.connectPoint(this, {
		center: {x: 0, y: '50%'},
		pos: 'left'
	}));
	//上边的连接点
	this.connectPoints.push(this.connectTop=new this.connectPoint(this, {
		center: {x: '50%', y: 0},
		pos: 'top'
	}));
	//右边的连接点
	this.connectPoints.push(this.connectRight=new this.connectPoint(this, {
		center: {x: '100%', y: '50%'},
		pos: 'right'
	}));
	//下边的连接点
	this.connectPoints.push(this.connectBottom=new this.connectPoint(this, {
		center: {x: '50%', y: '100%'},
		pos: 'bottom'
	}));
	//中间的连接点
	this.connectPoints.push(this.connectCenter=new this.connectPoint(this, {
		center: {x: '50%', y: '50%'},
		pos: 'center'
	}));

	this.connectPointsVisible(false);//默认隐藏
}

/**
 * 显示或隐藏连接点
 */
jmDraw.jmElement.prototype.connectPointsVisible = function(s) {
	if(this.connectPoints) {
		for(var i=0;i<this.connectPoints.length;i++) {
			this.connectPoints[i].visible = !!s;
			if(!s) this.connectPoints[i].sideShape.visible = false;
		}
	}
}

/**
 * 添加当前元素到画布中
 *
 * @method add
 * @for jmElement
 */
jmDraw.jmElement.prototype.add = function() {
	
	if(this.rect) this.children.add(this.rect);	
	this.graph.children.add(this);
	//如果可以移动
	if(this.editor.movable) {
		this.canMove(true);
	}
	var self = this;
	
	if(this.shape) {
		this.children.add(this.shape);

		/*if(this.connectable) {		
			this.shape.bind('mousemove',function() {
				this.parent.connArc.visible = true;
			});
			this.shape.bind('mouseleave',function() {		
				if(this.parent.editor.connectFrom != this.parent) {
					this.parent.connArc.visible = false;
				}		
			});
			
			this.children.add(this.connArc);	
			this.connArc.canMove(true);
			//开始移动连线
			this.connArc.on('movestart',function(args) {				
				_tselfhis.editor.connectFrom = self;
				self.connectLine.visible = true;
			});
			//结束移动时归位
			this.connArc.on('moveend',function(args) {				
				var arccenter = self.connArc.center();
				arccenter.x = '50%';
				arccenter.y = '50%';
				self.editor.connectFrom = null;
				self.connectLine.visible = false;
				self.connArc.visible = false;
			});
		}*/

		//如果当前节点被移动，则重新定位子元素
		this.on('move',function(args) {
			this.initPosition();//重新定位
		});
		this.on('movestart',function(args) {
			this.connectPointsVisible(true);
		});
		this.on('moveend',function(args) {
			this.connectPointsVisible(false);
		});
	}
	

	this.children.add(this.label);	
	this.resize();

	//监听大小改变
	if(this.rect){
		this.rect.on('resize',function(px,py,dx,dy) {		
			if(typeof px == 'number') self.position.x += px;
			if(typeof py == 'number') self.position.y += py;
			if(typeof dx == 'number') {
				var w = self.width + dx;
				self.width = w;
			}
			if(typeof dy == 'number') {
				var h = self.height + dy;
				self.height = h;
			}
			self.resize();
		});
	}

	//生成默认的连接点
	if(this.style.connectPoint) this.createConnectPoints();

	//单击选当前元素
	this.bind('mousedown',function(evt) {			
		//if(evt.button == 1) {
			//如果没有按下ctrl健，且没有被选中，则清除其它选中
			if(!evt.ctrlKey && !this.selected) {
				this.editor.selectAll(false,this.id);
			}				
			//选择当前节点		
			if(!this.selected) this.select(true);
			//evt.cancel = true;
		//}
	});
	
	//当有连线拉到当前元素上时，连接这二个元素
	this.bind('mouseup',function(evt) {
			
	});
}

/**
 * 大小改变事件
 * 重置各元素大小和位置
 *
 * @method resize
 * @for jmElement
 * @private
 */
jmDraw.jmElement.prototype.resize = function() {
	var w = this.width;
	var h = this.height;	

	var center = this.center;
	//如果设有padding
	//则计算大小减去padding大小
	if(this.style.padding) {
		w = w - (this.style.padding.left || 0) - (this.style.padding.right || 0);
		h = h - (this.style.padding.top || 0) - (this.style.padding.bottom || 0);
		center.x = w/2 + (this.style.padding.left || 0);
		center.y = h/2 + (this.style.padding.top || 0);
	}
	else {
		center.x = w / 2;
		center.y = h / 2;
	}
	//if(this.connArc) {
	//	this.connArc.center().x = center.x;
	//	this.connArc.center().y = center.y;
	//}
	this.initPosition();
}

/**
 * 重新初始化各位置
 * 
 * @method initPosition
 * @for jmElement
 * @private
 */
jmDraw.jmElement.prototype.initPosition = function() {

	if(this.rect) {
		this.rect.width = this.width;
		this.rect.height = this.height;
	}

	//如果已设定标识信息，则定位
	if(this.overlay) {
		if(this.overlay.tagName == 'IMG') {
			var bounds = this.getAbsoluteBounds();
			var top = bounds.bottom;
			var left = bounds.right;

			if(this.style && this.style.overlay && this.style.overlay.margin) {
				if(this.style.overlay.margin.left) {
					left += this.style.overlay.margin.left;				
				}
				if(this.style.overlay.margin.top) {
					top += this.style.overlay.margin.top;
				}
			}

			this.overlay.style.top = top + 'px';
			this.overlay.style.left = left + 'px';		
		}
		else {
			var op = this.overlay.position;
			op.x = this.width;
			op.y = this.height;
		}
	}
}

/**
 * 初始化路径，这里重写来计算一些绘制前的准备工作
 *
 * @method initPoints
 * @for jmElement
 */
/*jmDraw.jmElement.prototype.initPoints = function(){

	var rotation = this.getRotation();//获取当前旋转参数
	//如果有旋转参数，则需要转换坐标再处理
	if(rotation && rotation.angle != 0) {	
		var p = this.position();	
		//rotateX ,rotateY 是相对当前控件的位置
		jmUtils.rotatePoints([this.pos1,this.pos2,this.pos3,this.pos4], {
			x: rotation.rotateX + p.x,
			y: rotation.rotateY + p.y
		}, rotation.angle);
	}
}*/

/**
 * 选择当前节点
 *
 * @method select
 * @for jmElement
 * @param {boolean} b 选择或消选当前元素
 * @param {boolean} [raiseEvent=true] 是否触发选择事件
 * @return {boolean} 是否被选择
 */
jmDraw.jmElement.prototype.select = function(b,raiseEvent) {
	var changed = false;//是否改变了选择状态
	if(b === false && this.selected === true) {
		//this.rect.style.stroke = 'transparent';	
		if(this.rect) this.rect.visible = false;	
		this.selected = false;	
		changed = true;	
	}
	else if(b === true && !this.selected) {
		this.selected = true;	
		if(this.rect) this.rect.visible = true;	
		changed = true;		
	}
	if(changed) {	
		//触发选择事件
		if(raiseEvent !== false) {
			this.emit('select',this.selected);
		}		
	}	
}

/**
 * 连接到目标节点
 * 
 * @method connect
 * @for jmElement
 * @param {jmElement} to 要连接到的元素
 * @param {number} id 指定当前连线的id
 * @param {string} [txt] 当前连线显示的字符值
 */
jmDraw.jmElement.prototype.connect = function(to,id,txt) {
	//查找相同的连线，如果存在则不重连
	var line  = this.connects.get(function(l) {
		return (l.from == this && l.to == to);
	});
	if(!line) {
		//检查元素是否可连接
		if(this.editor.validConnect && !this.editor.validConnect(this,to)) {
			return false;
		}

		id = id || this.editor.maxId();
		line = this.graph.createShape('cellConnectLine',{
			id:id,
			from:this,
			to:to,
			style:jmUtils.clone(this.style.connectLine),
			editor:this.editor
		});	
		
		this.connects.add(line);
		to.connects.add(line);
		line.text(txt);
		this.graph.children.add(line);
		this.editor.connects.add(line);//记录到编辑器中

		//连线鼠标进入控件
		line.bind('mouseover',function() {	
			if(!this.selected)	 {
				var overstroke = this.style && this.style.overStroke?this.style.overStroke:this.editor.defaultStyle.connectLine.overStroke;
				this.style.stroke = overstroke;
				this.style.zIndex = 2000;
			}			
		});
		//连线鼠标离开控件
		line.bind('mouseleave',function() {
			if(!this.selected) {
				var stroke = this.style && this.style.normalStroke?this.style.normalStroke:this.editor.defaultStyle.connectLine.stroke;
				this.style.stroke = stroke;
				this.style.zIndex = 1;
			}			
		});
		//当按下鼠标时选择当前线
		line.bind('mousedown',function(evt) {
			var b = this.selected;	
			if(!evt.ctrlKey && !this.selected) {
				this.editor.selectAll(false,this.id);
			}
			
			this.select(!b);			
			return false;
		});
	}
}

/**
 * 返回或设置当前元素的值 
 *
 * @method text
 * @for jmElement
 * @param {string} [v] 元素显示的值
 * @return {string} 当前的值
 */
jmDraw.jmElement.prototype.text = function(v) {
	if(typeof v !== 'undefined') {
		if(this.label) {
			this.label.text = v;
		}
		return this.setValue('text',v);
	}
	return this.getValue('text');
}

/**
 * 设定或获取中心点
 * 
 * @method center
 * @for jmHArc
 * @param {point} p 中心点坐标
 * @return {point} 当前中心点坐标
 */
jmDraw.jmElement.prototype.center = function(p) {
	return this.setValue('center',p);
}

/**
 * 从编辑器中移除当前节点
 *
 * @method remove
 * @for jmElement
 */
jmDraw.jmElement.prototype.remove = function(r) {
	if(r) return;
	if(this.editor) {
		this.editor.cells.remove(this);	
		this.graph.children.remove(this);	
		if(this.overlay && this.overlay.parentElement) {
			this.overlay.parentElement.removeChild(this.overlay);
		}
	}
	//并移除它的连线
	this.connects.each(function(i,c) {
		c.remove();	
	},true);
}

/**
 * 图形的连接点
 * @param {jmElement} el 连接点所属图形
 * @param {object} option 连接点参数, {center:中心, pos: 在父图形位置，left,top,right,bottom,center}
 */
jmDraw.jmElement.prototype.connectPoint = function(el, option) {
	//继承属性绑定
	jmUtils.extend(this, new jmControl(el.graph, {style: el.style.connectPoint || el.editor.defaultStyle.cell}));
	this.style = el.style.connectPoint || jmDraw.defaultStyle.cell.connectPoint;
	this.graph = el.graph;

	this.initializing(this.graph.context,this.style);

	this.type = 'jmConnectPoint';//表明是元素的连接点

	//所处位置	
	this.pos = option.pos;
	var width = 5;
	var height = 5;
	this.width = width;
	this.height = height;

	//获取中心位置
	//isAbsolute是否为获取对画布的绝对路径
	//chkRotate是否计算旋转
	this.getCenter = function(isAbsolute, chkRotate) {
		var c = this.center()||{x:0,y:0};
		var cx = c.x;
		var cy = c.y;

		//如果是相对于你容器的百分比
		var parentLoc = this.parent.getLocation();
		if(jmUtils.checkPercent(cx)) {
			cx = parentLoc.width * jmUtils.percentToNumber(cx);
		}
		if(jmUtils.checkPercent(cy)) {
			cy = parentLoc.height * jmUtils.percentToNumber(cy);
		}
		var cp = {x: cx, y: cy};
		if(chkRotate) {
			var rotation = this.getRotation();//获取当前旋转参数
			if(rotation && rotation.angle) {
				var bounds = this.getBounds();	
				cp = jmUtils.rotatePoints(cp, {
					x: rotation.rotateX + bounds.left,
					y: rotation.rotateY + bounds.top
				}, rotation.angle);
			}
		}
		if(isAbsolute) {
			var loc = this.parent.getLocation();
			cp.x += loc.left;
			cp.y += loc.top;
		}
		return cp;		
	}

	//初始化中当控件边界点
	this.points = [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}];
	this.initPoints = function(){
		var c = this.getCenter()

		this.points[0].x = c.x - width/2;
		this.points[0].y = c.y - height/2;
		this.points[1].x = c.x + width/2;
		this.points[1].y = this.points[0].y;
		this.points[2].x = this.points[1].x;
		this.points[2].y = c.y + height/2;
		this.points[3].x = this.points[0].x;
		this.points[3].y = this.points[2].y;
	}

	//当前点中心位置
	this.center = function(p) {
		return this.setValue('center',p);
	}

	if(option.center) {
		this.center(option.center);
	}

	//中间的X图形
	this.xShape = this.graph.createShape('path', {style: this.style.xShape, points:[]});
	//生成X图形
	this.xShape.initPoints = function(){
		return this.points = [{
			x: 0, y:0
		},{
			x: width,
			y: height,
		}, {
			x: width,
			y:0,
			m: true //移到当前点起画
		},{
			x: 0,
			y: height
		}];
	}
	this.children.add(this.xShape);

	//连上的当前可连接指示图形
	this.sideShape = this.graph.createShape('path', {style: this.style.sideShape, points:[]});
	//生成指示图形坐标
	this.sideShape.initPoints = function(){
		return this.points = [
			{x: -width, y:0},
			{x: 0,y: 0}, 
			{x: 0,y:-height},
			{x: width,y: -height,m: true},
			{x: width,y:0},
			{x: width*2, y: 0},
			{x: width*2, y:height,m:true},
			{x: width,y: height},
			{x: width, y: height*2},
			{x: -width, y: height, m:true},
			{x: 0, y: height},
			{x: 0, y: height * 2}
		];
	}
	this.sideShape.visible = false;//对焦图形默认是不显示的
	this.children.add(this.sideShape);

	//加到父图形中
	el.children.add(this);
}



