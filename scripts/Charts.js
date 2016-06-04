var ScorePerLifeChartDPS = [];
var Chart3DPS            = [];
var Chart2DPS            = [];
var ScorePerLifeChart;
var Chart2;
var Chart3;

window.onload = function () {

  ScorePerLifeChart = new CanvasJS.Chart("chartScorePerLifeContainer",
  {
    title:{
      text: "Rezultat - št. iger"
    },
    axisX: {
      title: "št. iger"
    },
    axisY: {
      title: "Rezultat"
    },
    data: [{
      type: "line",
      dataPoints: ScorePerLifeChartDPS
    }]
  });

  Chart2 = new CanvasJS.Chart("chart2",
  {
    title:{
      text: "Raziskana stanja -št. iger"
    },
    axisX: {
      title: "št. iger"
    },
    axisY: {
      title: "Raziskana stanja"
    },
    data: [{
      type: "line",
      dataPoints: Chart2DPS
    }]
  });


  ScorePerLifeChart.render();
  Chart2.render();

}

var updateChart = function() {
  ScorePerLifeChart.render();
  Chart2.render();

};
