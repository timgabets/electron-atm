/**
 * Parse listener handles translations from network binary message to internal application message object
 */

const Parser = require('./src/controllers/parser.js');
const Trace = require('./src/controllers/trace.js');
const Log = require('./src/controllers/log.js');

let parser = new Parser();
let trace = new Trace();
let log = new Log();

ipc.on('parse-host-message', (event, data) => {
  var parsed = parser.parseHostMessage(data);
  log.log('Host message parsed:' + trace.object(parsed));
  ipc.send('host-message-parsed', parsed);
})
