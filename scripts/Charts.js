// Define charts variables
var ScorePerLifeChartDPS = [],
  ExploredStatesDPS = [],
  ScorePerLifeChart,
  ExploredStatesChart;

// Render charts
var renderCharts = function() {
  ScorePerLifeChart.render();
  ExploredStatesChart.render();
};

window.onload = function () {

  CanvasJS.addColorSet("BtsSuccess", ["#5cb85c"]);
  CanvasJS.addColorSet("BtsPrimary", ["#428bca"]);
  ScorePerLifeChart = new CanvasJS.Chart("chartScorePerLifeContainer",
    {
      title:{
        text: ""
      },
      axisX: {
        title: "Number of Games"
      },
      axisY: {
        title: "Score"
      },
      data: [{
        type: "line",
        dataPoints: ScorePerLifeChartDPS
      }],
      colorSet: "BtsSuccess"
    }
  );

  ExploredStatesChart = new CanvasJS.Chart("ExploredStatesChartContainer",
    {
      title:{
        text: ""
      },
      axisX: {
        title: "Number of Games"
      },
      axisY: {
        title: "Explored states"
      },
      data: [{ 
        type: "line",
        dataPoints: ExploredStatesDPS
      }],
      colorSet: "BtsPrimary"
    }
  );
  // Render charts
  renderCharts();
}

