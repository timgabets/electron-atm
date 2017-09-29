/**
 * Builder listener handles translations from network binary message to internal application message object
 */

const Builder = nodeRequire('./src/controllers/builder.js');

//TODO: pass LUNO properly
let builder = new Builder('000');

ipc.on('build-message-to-host', (event, message) => {
  var built = builder.build(message);
  if(built){
  	log.info('ATM message built:' + trace.object(message));
    ipc.send('atm-message-built', built);
  }
})
