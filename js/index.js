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
    d.prevAge=-1;
    d.prevIndex=-1;
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
var cluster;
var patients=[];
var patientsObjs={};
var ages=[];
var line=d3.svg.line().interpolate("cardinal")
for (var yy=10;yy<120;yy++)
    for (var mm=1;mm<=12;mm++)ages[ages.length]=yy+0.01*mm;
function getColorofPatient(p){
    return d3.hsl(parseInt(300*(patients.indexOf(p)/patients.length)),0.5,0.6)


}
function getColorbyDeathRisk(r){
    return d3.rgb(parseInt(255*Math.sqrt(r)),parseInt(255-255*Math.sqrt(r)),0)
}

d3.csv("clu_info.csv",type,function (err,data) {

    if(err){
        alert("error loading data");
        return;
    }
    console.log(data);
    clu_info=data;
    var k=0;
    var lastSeenPoint={};
    drawAxis();
    for(var i=0;i<clu_info.length;i++){
        var d=clu_info[i];
        if(patients.indexOf(d.patient)==-1) {
            patients[k] = d.patient;
            patientsObjs[d.patient]={path:[],firstDate:-1,deathDate:-1};
            patientsObjs[d.patient].path.push([xScale(d.posX),yScale(d.posY)]);
            k++;
            clu_info[i].prevAge=d.age;
            patientsObjs[d.patient].firstDate=d.age;
            patientsObjs[d.patient].deathDate=d.age;
        }else {
            clu_info[i].prevAge=clu_info[lastSeenPoint[d.patient]].age;
            clu_info[i].prevIndex=lastSeenPoint[d.patient];
            patientsObjs[d.patient].path.push([xScale(d.posX),yScale(d.posY)]);
            patientsObjs[d.patient].deathDate=d.age;
        }
        lastSeenPoint[d.patient]=i;
    };

    d3.csv("cluster.csv",function (err,data) {

        if (err) {
            alert("error loading data");
            return;
        }
        //console.log(data);
        cluster=data;

        drawCluster();
        drawLine();
        drawPoint();
        drawControl();
    });
});
var width = window.innerWidth-16, height = window.innerHeight-16;

//d3.select('.container0').style("width",width+"px").style("height",height+"px");
var padding = { top: 50, right: 50, bottom: 50, left: 50 };
// 创建一个分组用来组合要画的图表元素

var main = d3.select('#mainsvg').append('g')
    // 设置该分组的transform属性
    .attr('transform', "translate(" + padding.top + ',' + padding.left + ')');
var control=d3.select("#controlsvg");
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
        .attr('r',3)
        .style('fill',function (d){
            return getColorbyDeathRisk(d.death_risk);
        })
        .style('fill-opacity','0.5')
        .on("mouseover",function (d,i) {
            d3.select("#textInfo1").text("患者："+d.patient);
            d3.select("#textInfo2").text("年龄："+d.age);
            filterbyPatient(d.patient);
        })
        .on("mouseout",function (d,i) {

            d3.select("#textInfo1").text("");
            d3.select("#textInfo2").text("");
            filterbyPatientCancel(d.patient);
        })
/*
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
                .attr('r',1);
        });*/
}
var mouseoverPatientCount=0;
function drawControl() {

    var width=document.getElementById("mainsvg").width.baseVal.value;
    var height=document.getElementById("mainsvg").height.baseVal.value;
    control.selectAll('.patientRect').data(patients).enter()
        .append('rect').attr('class','patientRect')
        .attr('x',function (d) {
            return patients.indexOf(d)*width/patients.length;
        })
        .attr('y',40).attr('width',1.0*width/patients.length).attr('height',20)
        .style('fill',function (d){
        return getColorofPatient(d);
        })
        .on("mouseover",function (d,i) {
            //console.log(d);
            d3.select("#textInfo1").text("当前患者："+d);
            filterbyPatient(d);
        })
        .on("mouseout",function (d,i) {
            //console.log(d);
            d3.select("#textInfo1").text("");
            filterbyPatientCancel(d);
        });

    control.selectAll('.ageRect').data(ages).enter()
        .append('rect').attr('class','ageRect')
        .attr('x',function (d) {
            return ages.indexOf(d)*width/ages.length;
        })
        .attr('y',100).attr('width',1.0*width/ages.length).attr('height',20)
        .style('fill','cyan')
        .on("mouseover",function (d,i) {
            //console.log(d);
            d3.select("#textInfo1").text("当前年龄："+d);
            filterbyAge(d);
            })
        .on("mouseout",function (d,i) {
            //console.log(d);

            d3.select("#textInfo1").text("");
            filterbyAgeCancel(d);
        });

}
function filterbyPatient(d){
    if(mouseoverPatientCount==0) {
        main.selectAll(".point").filter(function (dd, i) {
            return dd.patient != d
        }).style('fill-opacity', '0.0');
        main.selectAll(".line").filter(function (dd, i) {
            return dd != d
        }).style('stroke-opacity', '0.0');
    }
    mouseoverPatientCount++;
    main.selectAll(".point").filter(function(dd,i){return dd.patient==d}).style('fill-opacity','0.9');
    main.selectAll(".line").filter(function(dd,i){return dd==d}).style('stroke-opacity','0.9');
}
function filterbyPatientCancel(d){

    main.selectAll(".point").filter(function(dd,i){return dd.patient==d}).style('fill-opacity','0.0');
    main.selectAll(".line").filter(function(dd,i){return dd==d}).style('stroke-opacity','0.0');
    setTimeout(function () {
        mouseoverPatientCount--;
        if(mouseoverPatientCount==0) {
            //console.log('called');


            main.selectAll(".point").style('fill-opacity', '0.5');
            main.selectAll(".line").style('stroke-opacity', '0.5');
        }
    },10);
}

function filterbyAge(d) {
    if(mouseoverPatientCount==0) {
        main.selectAll(".point").filter(function (dd, i) {
            return dd.age != d
        }).style('fill-opacity', '0.0');
    }
    mouseoverPatientCount++;
    main.selectAll(".point").filter(function(dd,i){return dd.age>=d&&dd.prevAge<d}).style('fill-opacity',0.9);
    main.selectAll(".line").filter(function (dd,i) {return patientsObjs[dd].firstDate<=d&&patientsObjs[dd].deathDate>=d}).style('stroke-opacity','0.5');
    main.selectAll(".line").filter(function (dd,i) {return !(patientsObjs[dd].firstDate<=d&&patientsObjs[dd].deathDate>=d)}).style('stroke-opacity','0.0');
    //main.selectAll(".point").filter(function(dd,i){return !(dd.age>=d&&dd.prevAge<d)}).style('fill-opacity','0.0');
}
function filterbyAgeCancel(d) {
    main.selectAll(".point").filter(function(dd,i){return (dd.age>=d&&dd.prevAge<d)}).style('fill-opacity','0.0');
    setTimeout(function () {
        mouseoverPatientCount--;
        if(mouseoverPatientCount==0) {
            //console.log('called');

            d3.select("#textInfo1").text("");
            main.selectAll(".point").style('fill-opacity', '0.5');
            main.selectAll(".line").style('stroke-opacity','0.5');
        }
    },10);
}

function drawLine() {
    main.selectAll(".line").data(patients).enter()
        .append('path').attr('class','line')
        .attr('d',function(d){return line(patientsObjs[d].path)})
        .attr('fill','none')
        .attr('stroke',function(d){return getColorofPatient(d)})
        .attr('stroke-width',2)
        .style('stroke-opacity','0.5');
}

function drawCluster() {
    for(var i=0;i<cluster.length;i++){
        cluster[i].dataDistance=[];
    }
    for(var i=0;i<clu_info.length;i++) {
        var d = clu_info[i];
        var cx=xScale(cluster[d.cluster].centerX);
        var cy=yScale(cluster[d.cluster].centerY);
        var dx=xScale(d.posX);
        var dy=yScale(d.posY);
        cluster[d.cluster].dataDistance.push(Math.sqrt((cx-dx)*(cx-dx)+(cy-dy)*(cy-dy)));


    }

    for(var i=0;i<cluster.length;i++){
        cluster[i].dataDistance.sort(function sortNumber(a,b)
            {
                return a - b
            }
        );
    }
    cluster.sort(function sortby(a,b){
        return(b.dataDistance.length-a.dataDistance.length);
    });
    console.log(cluster);
    main.selectAll(".pointCluster").data(cluster).enter()

        .append('circle').attr("class","pointCluster")
        //.filter(function (dd,i){return i<=10})
        .attr('cx',function (d) {
            return xScale(d.centerX)
        })
        .attr('cy',function (d) {
            return yScale(d.centerY)
        })
        .attr('r',function (d) {
            return d.dataDistance[d.dataDistance.length-1]+3
        })
        .style('fill',function (d){
            return getColorbyDeathRisk(d.death_risk);
        })
        .style('fill-opacity',0.05)
        .style('stroke',d3.rgb(0,0,0))
        .style('stroke-opacity',0.05);
}