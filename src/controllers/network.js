const net = require('net');
const Trace = require('atm-trace');

class Network {
  constructor(ipc, log) {
    this.ipc = ipc;
    this.log = log;

    this.trace = new Trace();
    this.isConnected = false;
  }

  /**
   * [getOutgoingMessageLength get the Message Header Length]
   * @param  {[type]} data [binary data]
   * @return {[type]}      [two-bytes length, e.g. '\x00\x0a' for 10-byte data]
   */
  getOutgoingMessageLength(data){
    return String.fromCharCode(data.length / 256) + String.fromCharCode(data.length % 256);
  }

  /**
   * [send description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  send(data){
    let binary_data = Buffer(this.getOutgoingMessageLength(data) + data, 'binary');
    this.client.write(binary_data);
    this.trace.trace(binary_data, ' >> ' + binary_data.length + ' bytes sent:');
  }


  /**
   * [toggleConnect description]
   * @param  {[type]} host [description]
   * @param  {[type]} port [description]
   * @return {[type]}      [description]
   */
  toggleConnect(host, port){
    if(!this.isConnected){
      this.trace.trace('', ' >> Connecting to ' + host + ':' + port );

      this.client = net.createConnection({ host: host, port: port }, () => {
        this.isConnected = true;
        this.trace.trace('', ' >> Connected' );
        this.ipc.send('network-connection-status-change', this.isConnected);
      });

      this.client.on('error', (e) => {
        this.log.error(e);
      });

      this.client.on('end', _ => {
        this.isConnected = false;
        this.ipc.send('network-connection-status-change', this.isConnected);
        this.log.warn('Connection closed');
      });

      this.client.on('data', (data) => {
        this.trace.trace(data, ' << ' + data.length + ' bytes received:');
        this.ipc.send('network-data-received', data);
      });
    }else{
      this.client.end();
    }
  }
}

module.exports = Network;

