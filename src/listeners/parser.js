/**
 * Parse listener handles translations from network binary message to internal application message object
 */

const Parser = nodeRequire('ndc-parser');

let parser = new Parser();

ipc.on('parse-host-message', (event, data) => {
  var parsed = parser.parseHostMessage(data);
  log.info('Host message parsed:' + trace.object(parsed));
  ipc.send('host-message-parsed', parsed);
})
