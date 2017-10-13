const StatesService = nodeRequire('atm-states');
const ScreensService = nodeRequire('./src/services/screens.js');
const settings = nodeRequire('electron-settings');
//const Log = nodeRequire('./src/controllers/log.js');
const Trace = nodeRequire('./src/controllers/trace.js');
const ATM = nodeRequire('./src/controllers/atm.js');

//let log = new Log();
let trace = new Trace();
let atm = new ATM(settings, log);

let states = new StatesService(settings, log, trace);
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
        levelSeparation: 160,
        nodeSpacing: 160
    }
  },
  physics: false,
};

nodes = states.getNodes();

nodes.forEach(node => {
  node['size'] = 160;
  node['color'] = 'silver';
  node['shape'] = 'box';
  node['font'] = {'size': '32', 'face': 'monospace', 'align': 'center'};
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

$(function(){
  const mousetrap = nodeRequire('mousetrap');

  function updateState(state){   
    if($.isEmptyObject(state))
      state = states.get('000');

    graph.focus(
      state.number, 
      {
        scale: 0.3,
        offset: {}
      }
    );  // Center
    graph.selectNodes([state.number,]);   // Select node

    updateScreen(screens.get(state.screen_number));
    updateStateDetails(state, states.getExtensionState(state));
    // updateOpcodeBuffer(state);
  };

  /**
   * [updateScreen description]
   * @param  {[type]} screen [description]
   * @return {[type]}        [description]
   */
  function updateScreen(screen){
    if(screen && screen.actions){      
      screen.actions.forEach((element) => {
        if(element.display_image)
          $('#states-screen').attr('src', '/home/tim/share/screens/' + element.display_image);
      });
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

    if(state.states_to){
      $('#states-to').html('');
      state.states_to.forEach(state_to => {
        var state = states.get(state_to);
        $('#states-to').append('<button class="btn btn-default state-button" id="state-to-' + state.number + '">' + state.number + state.type + ' </button>');
        $('#state-to-' + state_to).on('click', _ => {
          updateState(states.get(state_to));
        })
      });      
    }
  };

  /**
   * [updateOpcodeBuffer description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  function updateOpcodeBuffer(state, extension_state){
    if(state && state.type === 'D'){
      atm.opcode.setBufferFromState(state, extension_state);
      $('#opcode-buffer').val(atm.opcode.getBuffer().split(' ').join('_'));
      $('#opcode-buffer').removeAttr('disabled');
    }else{
      $('#opcode-buffer').attr('disabled', true);
    }
  };

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
  
    updateState(states.get(state_number));
    $("#search-state-input").blur();
  });

  graph.on("click", function (params) {
    var node_id = this.getNodeAt(params.pointer.DOM);

    if(node_id){
      var state = states.get(node_id);

      updateScreen(screens.get(state.screen_number));
      updateStateDetails(state, states.getExtensionState(state));
      // graph.focus(state.number, {});  // Center

      // updateOpcodeBuffer(state);
    }
  });

  // cursor keys
  var cursorButtons = ['left', 'right', 'up', 'down'];
  cursorButtons.forEach( (element) => {
    mousetrap.bind(element, function() { 
      var move_x = 0;
      var move_y = 0;

      switch(element){
        case 'left':
          move_x = -700;
          break;
        case 'right':
          move_x = 700;
          break;
        case 'up':
          move_y = -700;
          break;
        case 'down':
          move_y = 700;
          break;
      }

      var current_position = graph.getViewPosition();
      graph.moveTo({
        position: {
          'x': current_position.x + move_x,
          'y': current_position.y + move_y,
        },
        animation: {
          duration: 300,
          easingFunction: 'easeOutQuad'
        }
      });
    });
  });

  ipc.on('ui-change-current-state-on-states-page', (event, state) => {
    updateState(state);
  });

  // Set to 000 initially
  updateState();
});
