"use strict";

var initOrder = require("./init-order"),
    crossCount = require("./cross-count"),
    sortSubgraph = require("./sort-subgraph"),
    buildLayerGraph = require("./build-layer-graph"),
    addSubgraphConstraints = require("./add-subgraph-constraints"),
    Graph = require("../graphlib").Graph,
    util = require("../util");

module.exports = order;

/*
 * Applies heuristics to minimize edge crossings in the graph and sets the best
 * order solution as an order attribute on each node.
 *
 * Pre-conditions:
 *
 *    1. Graph must be DAG
 *    2. Graph nodes must be objects with a "rank" attribute
 *    3. Graph edges must have the "weight" attribute
 *
 * Post-conditions:
 *
 *    1. Graph nodes will have an "order" attribute based on the results of the
 *       algorithm.
 */
function order(g) {
  var maxRank = util.maxRank(g),
    downLayerGraphs = buildLayerGraphs(g,
      //  _.range(1, maxRank + 1),
      Array.apply(0, Array(maxRank)).map(function(v, i) { return i + 1; }),
      "inEdges"),
    upLayerGraphs = buildLayerGraphs(g,
      // _.range(maxRank - 1, -1, -1),
      Array.apply(0, Array(maxRank)).map(function(v, i) { return maxRank - i - 1; }),
      "outEdges");


  var layering = initOrder(g);
  assignOrder(g, layering);

  var bestCC = Number.POSITIVE_INFINITY,
      best;

  for (var i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
    sweepLayerGraphs(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2);

    layering = util.buildLayerMatrix(g);
    var cc = crossCount(g, layering);
    if (cc < bestCC) {
      lastBest = 0;
      best = JSON.parse(JSON.stringify(layering));
      bestCC = cc;
    }
  }

  assignOrder(g, best);
}

function buildLayerGraphs(g, ranks, relationship) {
  return ranks.map(function(rank) {
    return buildLayerGraph(g, rank, relationship);
  });
}

function sweepLayerGraphs(layerGraphs, biasRight) {
  var cg = new Graph();
  layerGraphs.forEach(function(lg) {
    var root = lg.graph().root;
    var sorted = sortSubgraph(lg, root, cg, biasRight);
    sorted.vs.forEach(function(v, i) {
      lg.node(v).order = i;
    });
    addSubgraphConstraints(lg, cg, sorted.vs);
  });
}

function assignOrder(g, layering) {
  layering.forEach(function(layer) {
    layer.forEach(function(v, i) {
      g.node(v).order = i;
    });
  });
}
