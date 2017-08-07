var options = {
  edges: {
    smooth: {
      type: 'cubicBezier',
      forceDirection: 'horizontal',
      roundness: 0.4
    }
  },
  layout: {
    hierarchical: {
        direction: 'LR',
        levelSeparation: 150,
        nodeSpacing: 150
    }
  },
  physics: false,
};


nodes = states.getNodes();

nodes.forEach(node => {
  node['size'] = 150;
  node['color'] = 'white';
  node['shape'] = 'box';
  node['font'] = {'size': '28', 'face': 'monospace', 'align': 'center'};
  node['heightConstraint'] = { minimum: 100 };
  node['widthConstraint'] = { minimum: 100 };
})

edges = states.getEdges()

edges.forEach( edge => {
  edge['arrows'] = 'to';
  edge['physics'] = false;
  edge['smooth'] = {'type': 'cubicBezier'};
});

var container = document.getElementById('mynetwork');
var data = {'nodes': nodes, 'edges': edges}
var graph = new vis.Network(container, data, options);

graph.on("click", function (params) {
  console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
});