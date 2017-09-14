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


$(function () {
  const mousetrap = nodeRequire('mousetrap');

  /**
   * [updateScreen description]
   * @param  {[type]} screen [description]
   * @return {[type]}        [description]
   */
  function updateScreen(screen){
    if(screen && screen.image_file){
      $('#states-screen').attr('src', '/home/tim/share/screens/' + screen.image_file);
    }
  };

  /**
   * [updateStateDetails description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  function updateStateDetails(state, extension_state){
    $('#state-details').html(trace.object(state));
    if(extension_state)
      $('#state-details').append(trace.object(extension_state));
  };

  /**
   * [updateOpcodeBuffer description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  function updateOpcodeBuffer(state, extension_state){
    if(state && state.type === 'D'){
      atm.setOpCodeBuffer(state, extension_state);
      $('#opcode-buffer').val(atm.opcode_buffer.split(' ').join('_'));
      $('#opcode-buffer').removeAttr('disabled');
    }else{
      $('#opcode-buffer').attr('disabled', true);
    }
  };

  graph.on("click", function (params) {
    var node_id = this.getNodeAt(params.pointer.DOM);

    if(node_id){
      var state = states.get(node_id);

      updateScreen(screens.get(state.screen_number));
      updateStateDetails(state, states.getExtensionState(state));
      updateOpcodeBuffer(state);
    }
  });


  graph.on("selectNode", function (params) {
    // TODO
  });


  graph.on("deselectNode", function (params) {
    // TODO
  });


  $("#search-state-form").submit(function(e) {
    e.preventDefault();
    var state_number = $('#search-state-input').val();

    if(state_number.length == 2){
      state_number = '0' + state_number;
      $('#search-state-input').val(state_number)
    }
    else if (state_number.length === 1){
      state_number = '00' + state_number;
      $('#search-state-input').val(state_number)
    }
  
    var state = states.get(state_number);
    if(state)
    {
      graph.focus(state.number, {});  // Center
      graph.selectNodes([state.number,]);   // Select node

      updateScreen(screens.get(state.screen_number));
      updateStateDetails(state, states.getExtensionState(state));
      updateOpcodeBuffer(state);
    }
  });
})
