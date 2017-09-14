// NodeJS net module
const net = require('net');
// trace routines
const Trace = require('../controllers/trace.js');
const ipc = electron.ipcRenderer

function Network(log) {
  this.trace = new Trace();
  //this.client = new net.Socket();
  this.isConnected = false;

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
   * [toggleConnect description]
   * @param  {[type]} host [description]
   * @param  {[type]} port [description]
   * @return {[type]}      [description]
   */
  this.toggleConnect = function(host, port){
    if(!this.isConnected){
      this.trace.trace('', ' >> Connecting to ' + host + ':' + port );

      this.client = net.createConnection({ host: host, port: port }, () => {
        this.isConnected = true;
        this.trace.trace('', ' >> Connected' );
        ipc.send('network-connection-established');
      });

      this.client.on('error', (e) => {
        log.error(e);
      });

      this.client.on('data', (data) => {
        this.trace.trace(data, '<< ' + data.length + ' bytes received:');
        ipc.send('network-data-received', data);
      });
    }else{
      this.client.end();
      
      this.isConnected = false;
      ipc.send('network-disconnected');
      log.warn('Connection closed');
    }
  };
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
