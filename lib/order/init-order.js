"use strict";

module.exports = initOrder;

/*
 * Assigns an initial order value for each node by performing a DFS search
 * starting from nodes in the first rank. Nodes are assigned an order in their
 * rank as they are first visited.
 *
 * This approach comes from Gansner, et al., "A Technique for Drawing Directed
 * Graphs."
 *
 * Returns a layering matrix with an array per layer and each layer sorted by
 * the order of its nodes.
 */
function initOrder(g) {
  var visited = {},
      simpleNodes = g.nodes().filter(function(v) {
        return !g.children(v).length;
      }),
      maxRank = simpleNodes.map(function(v) { return g.node(v).rank; })
        .reduce(function(r, v) { return Math.max(r, v); }),
      layers = Array.apply(0, Array(maxRank + 1)).map(function() { return []; });

  function dfs(v) {
    if (visited.hasOwnProperty(v)) return;
    visited[v] = true;
    var node = g.node(v);
    layers[node.rank].push(v);
    g.successors(v).forEach(dfs);
  }

  var orderedVs = simpleNodes.sort(function(a, b) {
    return g.node(a).rank - g.node(b).rand;
  });
  orderedVs.forEach(dfs);

  return layers;
}
