const Trace = require('../controllers/trace.js');

function FITsService(settings, log){
  this.FITs = settings.get('FITs');
  if(!this.FITs)
    this.FITs = {};  
  
}

module.exports = ScreensService
