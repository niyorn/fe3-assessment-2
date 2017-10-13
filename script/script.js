//Oi Niyornram
var man;
var women;
var width = 1500;
var height = 900;

//*******************SET-UP*******************//
//add a function that format csv to .txt so we can edit the text.
//We will remove all the unneed text and the remaing text
//we will parse it to d3
d3.text('data.csv')
  .mimeType('text/plain;charset=iso88591')
  .get(onload);

//Function that clean the data so we can use it for D3
function onload(err, text) {
  if (err) throw err;
  var header = text.lastIndexOf('Totaal mannen en vrouwen');
  var headerEnd = text.indexOf('\n', header);
  var footer = text.indexOf('©');
  //Remove unneeded text
  text = text.slice(headerEnd, footer);
  text = text.replace(/";"/g, ",").replace(/"/g, '').trim();
  //parse data
  var data = d3.csvParseRows(text, map);

  //Add function that remap the data so we have an array of data that we can use
  function map(d) {
    let data = {
      gender: d[0],
      year: d[3],
      underweight: d[4],
      normalweight: d[5],
      overweight: d[6]
    }
    return data
  }

  //To be able to select data as group, we gonna nest the data
  var nestData = d3.nest()
    .key(function(d) {
      return d.gender;
    })
    .entries(data).map(function(d) {
      return {
        gender: d.key,
        values: d.values
      }
    });

  //From here we're going to create a graph
  //This code is from Mike Bostock url: https://bl.ocks.org/mbostock/3887051
  //from here -->
  var svg = d3.select("svg"),
    margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  var g = svg.append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;
  //--to here

  let lowestDataPoint = 0;
  let highestDataPoint = 100;
  //Create a Y scale that show the percentage of the data
  var yAxis = d3.scaleLinear()
    .range([0, height])
    .domain([highestDataPoint, lowestDataPoint]);
  //create X-scale that show the years
  /**We're using the variable 'data' instead of 'nestedData'
  because I dont know how to flatten the data and because 'data' is
  still single level. We are able to use it here.*/
  var xAxis = d3.scaleBand()
    .range([0, width])
    .paddingInner(0.3)
    .domain(data.map( //<--data instead of nestData
      function(d) {
        return d.year;
      }));

  var manData = nestData[0].values;
  var womenData = nestData[1].values;
  var catagory = [{
    catagory: 'ondergewicht'
  }, {
    catagory: 'normaalgewicht'
  }];
  //create the x-as
  g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(yAxis));

  //create the y-as
  g.append('g')
    .attr('class', 'axis axis--x')
    .call(d3.axisBottom(xAxis))
    .attr('transform', 'translate(0,' + height + ')');


  function render(data) {
    //**********CREATE BAR*******************//
    //binding
    var rect = g.append('g').selectAll('rect').data(data);

    //This will be the underweight bar
    rect.enter()
      .append('rect')
      .transition()
      .duration(900)
      .attr('class', 'bar man underweight')
      .attr('x', function(d, i) {
        return xAxis(d.year);
      })
      .attr('y', function(d) {
        return yAxis(d.underweight);
      })
      .attr('height', function(d) {
        if (d.underweight > 1) {
          return height - yAxis(d.underweight);
        }
        return
      })
      .attr('width', xAxis.bandwidth())

    /*Because we're going to make a stacked chart, the y-coordination
    of the normal weight need be offset with underweight so that the
    bar will be on top off underweight bar*/
    //The normalweight bar
    rect.enter()
      .append('rect')
      .transition()
      .duration(1000)
      .attr('class', 'bar man normalweight')
      .attr('x', function(d, i) {
        return xAxis(d.year);
      })
      .attr('y', function(d) {
        return yAxis(+d.normalweight + +d.underweight); //<--this is what I mean by that
      })
      .attr('height', function(d) {
        if (d.normalweight > 1) {
          return height - yAxis(d.normalweight);
        }
        return
      })
      .attr('width', xAxis.bandwidth());

    //the overweight bar
    rect.enter()
      .append('rect')
      .transition()
      .duration(1200)
      .attr('class', 'bar man overweight')
      .attr('x', function(d, i) {
        return xAxis(d.year);
      })
      .attr('y', function(d) {
        return yAxis(+d.normalweight + +d.underweight + +d.overweight); //<--same story
      })
      .attr('height', function(d) {
        if (d.normalweight > 1) {
          return height - yAxis(d.overweight);
        }
        return
      })
      .attr('width', xAxis.bandwidth(0.2));

    //remove element
    d3.selectAll('.bar')
      .transition()
      .duration(700)
      .style("opacity", 0)
      .remove();
  }

  function renderCatagory1(data) {
    //**********CREATE BAR*******************//
    highestDataPoint = 60;
    //Create new Y scale
    var yAxis = d3.scaleLinear()
      .range([0, height])
      .domain([highestDataPoint, lowestDataPoint]);

    //binding
    var rect = g.append('g').selectAll('rect').data(data);
    //the overweight bar
    rect.enter()
      .append('rect')
      .transition()
      .duration(1200)
      .attr('class', 'bar man overweight')
      .attr('x', function(d, i) {
        return xAxis(d.year);
      })
      .attr('y', function(d) {
        return yAxis( +d.overweight); //<--same story
      })
      .attr('height', function(d) {
        if (d.normalweight > 1) {
          return height - yAxis(d.overweight);
        }
        return
      })
      .attr('width', xAxis.bandwidth(0.2));

    //remove element
    d3.selectAll('.bar')
      .transition()
      .duration(700)
      .style("opacity", 0)
      .remove();
  }

  function renderCatagory2(data) {
    //**********CREATE BAR*******************//
    highestDataPoint = 60;
    //Create new Y scale
    var yAxis = d3.scaleLinear()
      .range([0, height])
      .domain([highestDataPoint, lowestDataPoint]);

    //binding
    var rect = g.append('g').selectAll('rect').data(data);
    //the overweight bar
    rect.enter()
      .append('rect')
      .transition()
      .duration(1200)
      .attr('class', 'bar man normalweight')
      .attr('x', function(d, i) {
        return xAxis(d.year);
      })
      .attr('y', function(d) {
        return yAxis( +d.normalweight); //<--same story
      })
      .attr('height', function(d) {
        if (d.normalweight > 1) {
          return height - yAxis(d.normalweight);
        }
        return
      })
      .attr('width', xAxis.bandwidth(0.2));

    //remove element
    d3.selectAll('.bar')
      .transition()
      .duration(700)
      .style("opacity", 0)
      .remove();
  }

  function renderCatagory3(data) {
    //**********CREATE BAR*******************//
    highestDataPoint = 60;
    //Create new Y scale
    var yAxis = d3.scaleLinear()
      .range([0, height])
      .domain([highestDataPoint, lowestDataPoint]);

    //binding
    var rect = g.append('g').selectAll('rect').data(data);
    //the overweight bar
    rect.enter()
      .append('rect')
      .transition()
      .duration(1200)
      .attr('class', 'bar man underweight')
      .attr('x', function(d, i) {
        return xAxis(d.year);
      })
      .attr('y', function(d) {
        return yAxis( +d.underweight); //<--same story
      })
      .attr('height', function(d) {
        if (d.normalweight > 1) {
          return height - yAxis(d.underweight);
        }
        return
      })
      .attr('width', xAxis.bandwidth(0.2))
      .attr('fill', '#40C4FF');

    //remove element
    d3.selectAll('.bar')
      .transition()
      .duration(700)
      .style("opacity", 0)
      .remove();
  }
  //Click event that determine if the data that will be shown is a Women or a Mans data
  d3.selectAll('button').on('click', function() {
    var id = this.id;
    var manButton = document.querySelector('#man-data');
    var womenButton = document.querySelector('#women-data');

    //check if women or man
    if (id == 'man-data' || man == false) {
      render(manData);
      man = true;
      women = false;
      manButton.classList.add('active');
      womenButton.classList.remove('active');
    } else if (id == 'women-data') {
      render(womenData);
      women = true;
      men = false;
      var button = d3.selectAll('button');
      manButton.classList.remove('active');
      womenButton.classList.add('active');
    }
  });


  //Click event that determine which kind of catagory data that needs to be shown
  d3.selectAll('.catagory').on('click', function() {
    var catagory = this.id;
    if (catagory == 'catagory1') {
      if(man == true){
        renderCatagory1(manData);
      }
      else if(women == true){
        renderCatagory1(womenData);
      }
    } else if (catagory == 'catagory2') {
      if(man == true){
        renderCatagory2(manData);
      }
      else if(women == true){
        renderCatagory2(womenData);
      }
    } else if (catagory == 'catagory3') {
      if(man == true){
        renderCatagory3(manData);
      }
      else if(women == true){
        renderCatagory3(womenData);
      }
    }
  });
};
