function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  d3.json(`/metadata/${sample}`).then(function(sampleData) {
    console.log(sampleData);
  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    PANEL.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(sampleData).forEach(([key, value]) => {
      PANEL.append('h6').text(`${key}, ${value}`);
    })
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
})
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`/samples/${sample}`).then(function (sampleData) {
    console.log(sampleData);

    const otu_ids = sampleData.otu_ids;
    const otu_labels = sampleData.otu_labels;
    const sample_values = sampleData.sample_values;
    console.log(sampleData.otu_ids);
    console.log(sampleData.otu_labels);
    console.log(sampleData.sample_values);



    //Building Bubble chart
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: 'markers',
      marker: {
        size: sample_values,
        color: otu_ids,
        colorscale: 'Earth'
      }
    }];      

    var bubbleLayout = {
      margin: { t: 0 },
      hovermode: 'closest',
      xaxis: {title: 'OTU ID'},
    };

    Plotly.newPlot('bubble', bubbleData, bubbleLayout);

    // Building Pie Chart
    var pieData = [{
      values: sample_values.slice(0,10),
      labels: otu_ids.slice(0,10),
      hovertext: otu_labels.slice(0,10,),
      hoverinfo: 'hovertext',
      type: 'pie'
    }];

    var pieLayout = {
      margin: {t: 0, l: 0}
    }

    Plotly.newPlot('pie', pieData, pieLayout); 
   

  });

  }
  

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    buildGauge(firstSample)
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
 newSample = document.getElementById("selDataset").value;
  
  console.log(newSample)
  buildCharts(newSample);
  buildMetadata(newSample);
  buildGauge(newSample)
  
}

// Initialize the dashboard
init();

function buildGauge(sample) {
  Plotly.d3.json(`/wfreq/${sample}`, function(error, wfreq) {
      if (error) return console.warn(error);
      // Enter the washing frequency between 0 and 180
      var level = wfreq*20;
      // Trig to calc meter point
      var degrees = 180 - level,
          radius = .5;
      var radians = degrees * Math.PI / 180;
      var x = radius * Math.cos(radians);
      var y = radius * Math.sin(radians);
      // Path: may have to change to create a better triangle
      var mainPath = 'M -.0 -0.05 L .0 0.05 L ',
          pathX = String(x),
          space = ' ',
          pathY = String(y),
          pathEnd = ' Z';
      var path = mainPath.concat(pathX,space,pathY,pathEnd);
      var data = [{ type: 'scatter',
      x: [0], y:[0],
          marker: {size: 12, color:'850000'},
          showlegend: false,
          name: 'Freq',
          text: level,
          hoverinfo: 'text+name'},
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {
          colors:[
              'rgba(0, 105, 11, .5)', 'rgba(10, 120, 22, .5)',
              'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
              'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
              'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
              'rgba(240, 230, 215, .5)', 'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
      }];
      var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
              color: '850000'
          }
          }],
      title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
      height: 600,
      width: 600,
      xaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]}
      };
      var GAUGE = document.getElementById('gauge');
      Plotly.newPlot(GAUGE, data, layout);
  });
}