// Shortest path over DECLARED edges only (mission § 10.3) — a plain BFS
// on the Graphology graph already in memory. Never invents or infers a
// relationship: the result is exactly the sequence of edges the dataset
// already contains, or `null` if no such path exists.
export function shortestPath(graph, fromId, toId) {
  if (!graph.hasNode(fromId) || !graph.hasNode(toId)) return null;
  if (fromId === toId) return { nodes: [fromId], edges: [] };

  const visited = new Set([fromId]);
  const prevNode = new Map();
  const prevEdge = new Map();
  const queue = [fromId];

  while (queue.length) {
    const current = queue.shift();
    if (current === toId) break;
    for (const edgeId of graph.edges(current)) {
      const other = graph.source(edgeId) === current ? graph.target(edgeId) : graph.source(edgeId);
      if (!visited.has(other)) {
        visited.add(other);
        prevNode.set(other, current);
        prevEdge.set(other, edgeId);
        queue.push(other);
      }
    }
  }

  if (!visited.has(toId)) return null;

  const nodes = [toId];
  const edges = [];
  let cursor = toId;
  while (cursor !== fromId) {
    edges.unshift(prevEdge.get(cursor));
    cursor = prevNode.get(cursor);
    nodes.unshift(cursor);
  }
  return { nodes, edges };
}
