/**
 * Builder listener handles translations from network binary message to internal application message object
 */

const Builder = nodeRequire('./src/controllers/builder.js');

let host = settings.get('host');
if(host && host.luno)
  luno = host.luno;
else
  luno = '000';

if(host && host.header)
  header = host.header;
else
  header = '';

let builder = new Builder(luno, header);

ipc.on('build-message-to-host', (event, message) => {
  var built = builder.build(message);
  if(built){
    log.info('ATM message built:' + trace.object(message));
    ipc.send('atm-message-built', built);
  }
})
