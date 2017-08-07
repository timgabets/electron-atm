var opts = {
  manipulation: false,
  height: '90%',
  layout: {
    hierarchical: {
      enabled: true,
      levelSeparation: 300
    }
  },
  physics: {
    hierarchicalRepulsion: {
      nodeDistance: 100
    }
  }
};


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
        direction: 'UD',
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
console.log(nodes);

edges = states.getEdges()
/*
edges = [
  {from: '127', to: '500'},
];
*/

edges.forEach( edge => {
  edge['arrows'] = 'to';
  edge['physics'] = false;
  edge['smooth'] = {'type': 'cubicBezier'};
});
//console.log(edges);

var container = document.getElementById('mynetwork');
var data = {'nodes': nodes, 'edges': edges}
var gph = new vis.Network(container, data, options);
