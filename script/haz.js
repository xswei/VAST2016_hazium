window.onload = init;
function init(){
	window.options = {
		width:window.innerWidth,
		height:window.innerHeight,
		dataset:{}
	}
	d3.select("div.main").append("svg")
		.attr({
			width:options.width,
			height:options.height
		})
	loadFile(); 
}
function loadFile(){
	d3.csv("./dataset/f1z8a-MC2.csv",function(e1,f1z8a){
		if(e1){console.log(e1);return;}
		options.dataset.f1z8a = f1z8a;
		d3.csv("./dataset/f2z2-MC2.csv",function(e2,f2z2){
			if(e2){console.log(e2);return;}
			options.dataset.f2z2 = f2z2;
			d3.csv("./dataset/f2z4-MC2.csv",function(e3,f2z4){
				if(e3){console.log(e3);return;}
				options.dataset.f2z4 = f2z4;
				d3.csv("./dataset/f3z1-MC2.csv",function(e4,f3z1){
					if(e4){console.log(e4);return;}
					options.dataset.f3z1 = f3z1;
					renderHaz();
				})
			})
		})
	})
}
function renderHaz(){
	var svg = d3.select("svg");

	var margin={
		top:30,right:30,bottom:30,left:30
	}
	var focusWidth = options.width-margin.right-margin.left,
		contextHeight = 100,
		focusHeight = options.height-margin.bottom*2-2*margin.top-contextHeight;
	svg.append("defs")
		.append("clipPath")
		.attr("id","clip")
		.append("rect")
		.attr("width",focusWidth)
		.attr("height",focusHeight)
	var x = d3.time.scale().range([0, focusWidth]),
		x2 = d3.time.scale().range([0, focusWidth]),
		y = d3.scale.linear().range([focusHeight, 0]),
		y2 = d3.scale.linear().range([contextHeight ,0]);
	var xAxis = d3.svg.axis().scale(x).orient("bottom"),
		xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
		yAxis = d3.svg.axis().scale(y).orient("left");
	var brush = d3.svg.brush()
		.x(x2)
		.on("brush", brushed);
	var line = d3.svg.line()
		.interpolate("linear")
		.x(function(d){
			return x(new Date(d.time));
		})
		.y(function(d){
			return y(parseFloat(d.hazValue));
		})
	var line2 = d3.svg.line()
		.x(function(d){
			return x2(new Date(d.time))
		})
		.y(function(d){
			return y2(parseFloat(d.hazValue));
		})
	var info_tip = svg.append("g")
		.attr("transform","translate("+(margin.left+60)+","+margin.top+")");
	var tip_array = [];
	for(haz in options.dataset){
		tip_array.push(haz);
	}
	info_tip.selectAll("line")
		.data(tip_array).enter()
		.append("line")
		.attr("x1",0)
		.attr("y1",function(d,i){
			return i*20;
		})
		.attr("x2",30)
		.attr("y2",function(d,i){
			return i*20;
		})
		.attr("class",function(d){
			return d;
		})
	info_tip.selectAll("text")
		.data(tip_array).enter()
		.append("text")
		.attr("class","tip_text")
		.attr("x",50)
		.attr("dy",".35em")
		.attr("y",function(d,i){
			return i*20;
		})
		.text(function(d){
			return d;
		})

	d3.select("div.checkbox")
		.style("left",margin.left+220+"px")
		.style("top",margin.top-5+"px")
		.style("display","block")


	var focus = svg.append("g")
		.attr("class","focus")
		.attr("transform","translate("+margin.left+","+margin.top+")")
	var context = svg.append("g")
		.attr("class","context")
		.attr("transform","translate("+margin.left+","+(focusHeight+margin.top+margin.bottom+20)+")")
	x.domain([new Date("2016-5-31"),new Date("2016-6-14")])
	y.domain([0,10])
	x2.domain(x.domain());
	y2.domain(y.domain());
	focus.append("text")
		.attr("class","tip_text")
		.attr("dy","-.5em")
		.attr("transform","rotate(90)")
		.text("Hazium Concentration")
	focus.append("g")
		.attr("class","focus_axis")
		.attr("transform","translate(0,"+(focusHeight+10)+")")
		.call(xAxis)
	var mouse_tip = focus.append("g")
		.attr("class","mouse_tip")
		.style("display","none")
	mouse_tip.append("path")
		.attr("d",'M0,0V0,'+focusHeight+'')
		.attr("stroke","white")
		.attr("stroke-width",.5)
	mouse_tip.append("text")
	focus.append("rect")
		.attr("width",focusWidth)
		.attr("height",focusHeight)
		.attr("fill","#ccc")
		.style("cursor","crosshair")
		.attr("opacity",0)
		.on("mousemove",function(){
			mouse_tip.style("display","block")
			mouse_tip.attr("transform","translate("+d3.event.offsetX+","+0+")")
			var text_temp = mouse_tip.select("text")
				.attr("x",10)
				.attr("y",d3.event.offsetY)
				.attr("class","tip_text")
				.text(function(){
					var time = x.invert(d3.event.offsetX);
					var minute = time.getMinutes();
					minute =(Math.floor(minute/5)*5)<10?"0"+(Math.floor(minute/5)*5):(Math.floor(minute/5)*5);
					return "Time : "+(time.getMonth()+1)+"-"+time.getDate()+" "+(time.getHours()<10?"0"+time.getHours():time.getHours())+":"+minute;
				});

		})
		.on("mouseout",function(d){
			mouse_tip.select("text").text();
			mouse_tip.style("display","none")
		})
	focus.append("g")
		.attr("class","focus_axis")
		.call(yAxis)
		.selectAll("g")
		.append("path")
		.attr("stroke","#ccc")
		.attr("stroke-width",0.1)
		.attr("d",function(d){
			return "M0,0H"+focusWidth+" 0";
		})
	context.append("g")
		.attr("class","context_axis")
		.attr("transform","translate("+0+","+contextHeight+")")
		.call(xAxis2)

	for(h in options.dataset){
		console.log(h);
		focus.append("path")
			.datum(options.dataset[h])
			.attr("class","line "+h)
			.attr("fill","none")
			.attr("stroke","#ccc")
			.attr("d",d3.svg.line().x(function(d){return x(new Date(d.time))}).y(focusHeight))
			.transition()
			.duration(1000)
			.attr("d",line)
		context.append("path")
			.datum(options.dataset[h])
			.attr("fill","none")
			.attr("class",h)
			.attr("stroke","#ccc")
			.attr("d",d3.svg.line().x(function(d){return x(new Date(d.time))}).y(contextHeight))
			.transition()
			.duration(1000)
			.attr("d",line2)
	}
	context.append("g")
		.attr("class","x brush")
		.call(brush)
		.selectAll("rect")
		.attr("y",0)
		.attr("height",contextHeight)

	function brushed(){
		 x.domain(brush.empty() ? x2.domain() : brush.extent());
		focus.selectAll("path.line").attr("d", line);
		focus.select(".focus_axis").call(xAxis);
	}
}
function chose(input){
	var id = d3.select(input).property("name");
	var checked = d3.select(input).property("checked"),
		selector = "path."+id;
	d3.select(".focus")
		.select(selector)
		.style("display",checked?"block":"none")
	d3.select(".context")
		.select(selector)
		.style("display",checked?"block":"none")
}