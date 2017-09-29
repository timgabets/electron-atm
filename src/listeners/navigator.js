const StatesService = nodeRequire('./src/services/states.js');
const ScreensService = nodeRequire('./src/services/screens.js');
const settings = nodeRequire('electron-settings');
const Log = nodeRequire('./src/controllers/log.js');
const Trace = nodeRequire('./src/controllers/trace.js');
const ATM = nodeRequire('./src/controllers/atm.js');

let log = new Log();
let trace = new Trace();
let atm = new ATM(settings, log);

let states = new StatesService(settings, log);
let screens = new ScreensService(settings, log);

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
