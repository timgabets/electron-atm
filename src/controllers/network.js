// NodeJS net module
const net = nodeRequire('net');
// trace routines
const Trace = nodeRequire('./src/controllers/trace.js');
// log routines
const Log = nodeRequire('./src/controllers/log.js');

function Network() {
    /**
     * [getOutgoingMessageLength get the Message Header Length]
     * @param  {[type]} data [binary data]
     * @return {[type]}      [two-bytes length, e.g. '\x00\x0a' for 10-byte data]
     */
    this.getOutgoingMessageLength = function (data){
      return String.fromCharCode(data.length / 256) + String.fromCharCode(data.length % 256);
    };

    /**
     * [send description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    this.send = function (data){
      var binary_data = Buffer(this.getOutgoingMessageLength(data) + data, 'binary');
      this.client.write(binary_data);
      this.trace.trace(binary_data, '>> ' + binary_data.length + ' bytes sent:');
    };

    /**
     * [connect description]
     * @param  {[type]} host [description]
     * @param  {[type]} port [description]
     * @return {[type]}      [description]
     */
    this.connect = function(host, port){
      this.client.connect(port, host, _ => {
        this.log.log('<b>Connected to ' + host + ':' + port + '</b>');
      });
    };

    this.trace = new Trace();
    this.log = new Log();
    this.client = new net.Socket();

    /**
     * [network disconnect listener]
     * @param  {[type]} )  [description]
     * @return {[type]}   [description]
     */
    this.client.on('close', _ => {
      //this.client.destroy();
      this.log.log('<b>Connection closed</b>');
    });
}

/**
 * [send description]
 * @param  {[type]} message [description]
 * @return {[type]}      [description]
 */
Network.prototype.send = function(message){
  this.send(message);
};

module.exports = Network
