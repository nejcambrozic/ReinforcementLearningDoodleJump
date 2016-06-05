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
      title: "lifes"
    },
    axisY: {
      title: "Score"
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
      title: "lifes"
    },
    axisY: {
      title: "Explored states"
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
