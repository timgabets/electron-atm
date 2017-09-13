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
  node['color'] = 'silver';
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

// Focus on state 000
graph.focus('000', {
  scale: 0.4,
  offset: {x:-400, y:200}
});

graph.on("click", function (params) {
  var node_id = this.getNodeAt(params.pointer.DOM);

  if(node_id){
    var state = states.get(node_id);
    var extension_state = states.getExtensionState(state);

    var screen = screens.get(state.screen_number);

    // Updating screen
    if(screen && screen.image_file){
      document.getElementById('states-screen').setAttribute("src", "/home/tim/share/screens/" + screen.image_file);
    }

    // Showing stte details
    document.getElementById('state-details').innerHTML = trace.object(state);
    if(extension_state)
      document.getElementById('state-details').append(trace.object(extension_state));

    // Opcode buffer
    if(state && state.type === 'D'){      
      atm.setOpCodeBuffer(state, extension_state);

      document.getElementById('opcode-buffer').value = atm.opcode_buffer.split(' ').join('_');
      document.getElementById('opcode-buffer').removeAttribute("disabled");
    }else{
      document.getElementById('opcode-buffer').setAttribute("disabled", true);
    }
  }
});