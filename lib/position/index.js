"use strict";

var util = require("../util"),
    positionX = require("./bk").positionX;

module.exports = position;

function position(g) {
  g = util.asNonCompoundGraph(g);

  positionY(g);

  var posX = positionX(g);
  Object.keys(posX).forEach(function(v) {
    var x = posX[v];
    g.node(v).x = x;
  });
}

function positionY(g) {
  var layering = util.buildLayerMatrix(g),
      rankSep = g.graph().ranksep,
      prevY = 0;
  layering.forEach(function(layer) {
    var maxHeight = layer.map(function(v) { return g.node(v).height; })
      .reduce(function(r, v) { return Math.max(r, v); });
    layer.forEach(function(v) {
      g.node(v).y = prevY + maxHeight / 2;
    });
    prevY += maxHeight + rankSep;
  });
}

