function makeResponsive() {
  var svgArea = d3.select("body").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  var radius = svgWidth*0.012;
  var txtsz = parseInt(svgWidth*0.009);

  var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 80
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  function xScale(healthData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  }

  function yScale(healthData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  }
  
  function renderXaxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  function renderYaxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

  function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  function renderAbbrs(abbrGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    abbrGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return abbrGroup;
  }

  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        if (chosenXAxis === "income") {  
          return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]} USD<br>${chosenYAxis}: ${d[chosenYAxis]}%`);

        } else if (chosenXAxis === "age"){
          return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]} <br>${chosenYAxis}: ${d[chosenYAxis]}%`);
        }
        else {
            return (`${d.state}, ${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}% <br>${chosenYAxis}: ${d[chosenYAxis]}%`);
        }
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(d) {
      toolTip.show(d,this);
    })
      .on("mouseout", function(d, index) {
        toolTip.hide(d);
      });
  
    return circlesGroup;
  }

d3.csv("assets/data/data.csv").then(function(healthData) {

    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.abbr = data.abbr;
    });

    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", radius)
      .attr("fill", "#85C1E9")
      .attr("stroke-width", "1")
      .attr("stroke", "#909497");

    var abbrGroup = chartGroup.selectAll("text")
      .exit()
      .data(healthData)
      .enter()
      .append("text")
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("font-size", txtsz+"px")
      .attr("text-anchor", "middle")
      .attr("class", "stateText");

    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("class", "xText")
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("class", "xText")
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("class", "xText")
      .attr("value", "income")
      .classed("inactive", true)
      .text("Income (Median)");

    var ylabelsGroup = chartGroup.append("g");

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("transform", `translate(-40, ${height / 2}) rotate(-90)`)
      .attr("dy", "1em")
      .attr("class", "yText")
      .classed("axis-text", true)
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("transform", `translate(-60, ${height / 2}) rotate(-90)`)
      .attr("dy", "1em")
      .attr("class", "yText")
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
      .attr("transform", `translate(-80, ${height / 2}) rotate(-90)`)
      .attr("dy", "1em")
      .attr("class", "yText")
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obese (%)");

    xlabelsGroup.selectAll("xText")
    .on("click", function() {

      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        
        chosenXAxis = value;
        console.log(chosenXAxis)
        xLinearScale = xScale(healthData, chosenXAxis);
        yLinearScale = yScale(healthData, chosenYAxis);

        xAxis = renderXaxes(xLinearScale, xAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        abbrGroup = renderAbbrs(abbrGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "poverty") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          }
        }
      });

      ylabelsGroup.selectAll("yText")
      .on("click", function() {
  
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
          chosenYAxis = value;
          //console.log(chosenXAxis)
          xLinearScale = xScale(healthData, chosenXAxis);
          yLinearScale = yScale(healthData, chosenYAxis);
  
          yAxis = renderYaxes(yLinearScale, yAxis);
  
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
  
          abbrGroup = renderAbbrs(abbrGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
  
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            }
          }
        });
    });
  }

  makeResponsive();

  d3.select(window).on("resize", makeResponsive);