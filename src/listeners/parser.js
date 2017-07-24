/**
 * Parse listener handles translations from network binary message to internal application message object
 */

const Parser = nodeRequire('./src/controllers/parser.js');
const Trace = nodeRequire('./src/controllers/trace.js');
const Log = nodeRequire('./src/controllers/log.js');

let parser = new Parser();
let trace = new Trace();
let log = new Log();

ipc.on('parse-host-message', (event, data) => {
  var parsed = parser.parseHostMessage(data);
  log.log('Host message parsed:' + trace.object(parsed));
  ipc.send('host-message-parsed', parsed);
})
