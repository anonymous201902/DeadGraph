/*
var width = 420,
    barHeight = 20;

var x = d3.scale.linear()
    .range([0, width]);

var chart = d3.select(".chart")
    .attr("width", width);

d3.csv("data.csv", type, function(error, data) {
    x.domain([0, d3.max(data, function(d) { return d.value; })]);

    chart.attr("height", barHeight * data.length);

    var bar = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

    bar.append("rect")
        .attr("width", function(d) { return x(d.value); })
        .attr("height", barHeight - 1)
        .transition()
        .attr("width", function(d) { return x(d.value*0.5); }).duration(1000);

    bar.append("text")
        .attr("x", function(d) { return x(d.value) - 3; })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function(d) { return d.value; })
        .transition()
        .attr("x", function(d) { return x(d.value*0.5) - 3; }).duration(1000);
});

function type(d) {
    d.value = +d.value; // coerce to number
    return d;
}
*/

function type(d) {
    /*
    age: "58.04"
    biomarker1_albumin: "30"
    biomarker2_k: "3.0"
    cluster: "29"
    death_risk: "0.0683371298405467"
    id: "0"
    importance_of_biomarker1_albumin: "0.8"
    importance_of_biomarker2_k: "0.2"
    patient: "98"
    posX: "0.11872752010822296"
    posY: "0.0016297217225655913"*/
    d.age=+d.age;
    d.biomarker1_albumin=+d.biomarker1_albumin;
    d.biomarker2_k=+d.biomarker2_k;
    d.cluster=+d.cluster;
    d.death_risk=+d.death_risk;
    d.id=+d.id;
    d.importance_of_biomarker1_albumin=+d.importance_of_biomarker1_albumin;
    d.importance_of_biomarker2_k=+d.importance_of_biomarker2_k;
    d.patient=+d.patient;
    d.posX=+d.posX;
    d.posY=+d.posY;
    return d;
}
var clu_info;
var patients=[];
function getColorofPatient(p){
    return d3.hsl(parseInt(360*(patients.indexOf(p)/patients.length)),0.5,0.6)
}
d3.csv("clu_info.csv",type,function (err,data) {

    if(err){
        alert("error loading data");
        return;
    }
    console.log(data);
    clu_info=data;
    var k=0;
    for(var i=0;i<clu_info.length;i++){
        var d=clu_info[i];
        if(patients.indexOf(d.patient)==-1)
            patients[k++]=d.patient;
    };
    drawAxis();
    drawPoint();
});
var width = window.innerWidth-16, height = window.innerHeight-16;

d3.select('.container').style("width",width+"px").style("height",height+"px");
var padding = { top: 50, right: 50, bottom: 50, left: 50 };
// 创建一个分组用来组合要画的图表元素

var main = d3.select('.container svg').append('g')
    // 设置该分组的transform属性
    .attr('transform', "translate(" + padding.top + ',' + padding.left + ')');
var xScale;
var yScale;
function drawAxis() {
    var minX=0;
    var maxX=0;
    var minY=0;
    var maxY=0;

    var width=document.getElementById("mainsvg").width.baseVal.value;
    var height=document.getElementById("mainsvg").height.baseVal.value;
    for(var i=0;i<clu_info.length;i++){
        var d=clu_info[i];
        minX=(minX>d.posX)?d.posX:minX;
        maxX=(maxX<d.posX)?d.posX:maxX;
        minY=(minY>d.posY)?d.posY:minY;
        maxY=(maxY<d.posY)?d.posY:maxY;
    }
    xScale = d3.scale.linear()
        .domain([minX, maxX])
        .range([0, width - padding.left - padding.right]);
// 创建y轴的比例尺
    yScale = d3.scale.linear()
        .domain([minY, maxY])
        .range([height - padding.top - padding.bottom, 0]);
// 创建x轴
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');
// 创建y轴
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');
// 把x轴应用到对应的SVG元素上
    main.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (height - padding.top - padding.bottom) + ')')
        .call(xAxis);
// 把y轴应用到对应的SVG元素上
    main.append('g')
        .attr('class', 'axis')
        .call(yAxis);
}

function clearPoint() {
    main.selectAll('.point').remove();
}
function drawPoint(){

    var width=document.getElementById("mainsvg").width.baseVal.value;
    var height=document.getElementById("mainsvg").height.baseVal.value;
    main.selectAll('.point').data(clu_info).enter()
        .append('circle').attr('class','point')
        .attr('cx',function (d) {
            return xScale(d.posX)
        })
        .attr('cy',function (d) {
            return yScale(d.posY)
        })
        .attr('r',2)
        .style('fill',function (d){
            return getColorofPatient(d.patient);
        })
        .style('fill-opacity','0.5');

    main.selectAll('.point')
        .on("mouseover",function(d,i){
            d3.select(this)
                .transition()
                .duration(100)
                .attr('r',10);
        })
        .on("mouseout",function(d,i){
            d3.select(this)
                .transition()
                .duration(100)
                .attr('r',2);
        });
}
