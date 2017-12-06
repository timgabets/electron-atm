const StatesService = nodeRequire('atm-states');
const ScreensService = nodeRequire('atm-screens');
const settings = nodeRequire('electron-settings');
const Trace = nodeRequire('atm-trace');
const ATM = nodeRequire('./src/controllers/atm.js');
const StatesHistory = nodeRequire('./src/services/history.js');

//let log = new Log();
let trace = new Trace();
const atm = new ATM(settings, log);

const states = new StatesService(settings, log, trace);
let screens = new ScreensService(settings, log);

const options = {
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

let nodes = states.getNodes();
nodes.forEach(node => {
  node['size'] = 160;

  switch(node.label[4]){
  case 'J':
    node['color'] = 'lightcoral';
    break;

  case 'I':
    node['color'] = 'palegreen';
    break;

  default:
    node['color'] = 'silver';
  }

  node['shape'] = 'box';
  node['font'] = {'size': '32', 'face': 'monospace', 'align': 'center'};
  node['heightConstraint'] = { minimum: 100 };
  node['widthConstraint'] = { minimum: 100 };
});

let edges = states.getEdges();
edges.forEach( edge => {
  edge['arrows'] = 'to';
  edge['physics'] = false;
  edge['smooth'] = {'type': 'cubicBezier'};
});

let container = document.getElementById('mynetwork');
let data = {'nodes': nodes, 'edges': edges};
let graph = new vis.Network(container, data, options);

$(function(){
  const mousetrap = nodeRequire('mousetrap');
  let history = new StatesHistory(15);

  function updateState(state){
    if(!state)
      state = states.get('000');
    
    graph.focus(
      state.get('number'), 
      {
        scale: 0.3,
        offset: {}
      }
    );  // Center
    graph.selectNodes([state.get('number'),]);   // Select node

    updateScreen(screens.get(state.get('screen_number')));
    updateStateDetails(state, states.getExtensionState(state));
    history.add(state.get('number'));
    redrawStateHistory();
  }

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
  }

  function redrawStateHistory(){
    $('#states-history').html('');
    history.get().forEach(state_number => {
      let state_type = states.get(state_number).get('type');
      $('#states-history').append('<button class="btn btn-sm state-button" id="state-history-' + state_number + '">' + state_number + ' ' + state_type + ' </button>');
      
      $('#state-history-' + state_number).on('click', _ => {
        graph.focus(
          state_number, 
          {
            scale: 0.3,
            offset: {}
          }
        );  // Center
        graph.selectNodes([state_number,]);   // Select node
        let state = states.get(state_number);
        updateScreen(screens.get(state.get('screen_number')));
        updateStateDetails(state, states.getExtensionState(state));
      });
    });      
  }

  /**
   * [updateStateDetails description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  function updateStateDetails(state, extension_state){
    $('#state-details').html(trace.object(state));
    if(extension_state)
      $('#state-details').append(trace.object(extension_state));

    $('#states-to').html('');
    if(state.get('states_to')){
      state.get('states_to').forEach(state_to => {
        let state = states.get(state_to);
        $('#states-to').append('<button class="btn btn-sm state-button" id="state-to-' + state.get('number') + '">' + state.get('number') + ' ' + state.get('type') + ' </button>');
        $('#state-to-' + state_to).on('click', _ => {
          updateState(states.get(state_to));
        });
      });      
    }
  }

  /**
   * [updateOpcodeBuffer description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  function updateOpcodeBuffer(state, extension_state){
    if(state && state.get('type') === 'D'){
      atm.opcode.setBufferFromState(state, extension_state);
      $('#opcode-buffer').val(atm.opcode.getBuffer().split(' ').join('_'));
      $('#opcode-buffer').removeAttr('disabled');
    }else{
      $('#opcode-buffer').attr('disabled', true);
    }
  }

  $('#search-state-form').submit(function(e) {
    e.preventDefault();
    let state_number = $('#search-state-input').val();

    if(state_number.length === 2){
      state_number = '0' + state_number;
      $('#search-state-input').val(state_number);
    } else if (state_number.length === 1){
      state_number = '00' + state_number;
      $('#search-state-input').val(state_number);
    }
  
    updateState(states.get(state_number));
    $('#search-state-input').blur();
  });

  graph.on('click', function (params) {
    let node_id = this.getNodeAt(params.pointer.DOM);
    if(node_id){
      let state = states.get(node_id);

      updateScreen(screens.get(state.get('screen_number')));
      updateStateDetails(state, states.getExtensionState(state));
      // graph.focus(state.number, {});  // Center

      // updateOpcodeBuffer(state);
    }
  });

  // cursor keys
  let cursorButtons = ['left', 'right', 'up', 'down'];
  cursorButtons.forEach( (element) => {
    mousetrap.bind(element, function() { 
      let move_x = 0;
      let move_y = 0;

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

      let current_position = graph.getViewPosition();
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

  ipc.on('ui-change-current-state-on-states-page', (event) => {
    updateState(atm.getCurrentState());
  });

  // Set to 000 initially
  updateState();
});
