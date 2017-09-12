const StatesService = require('./src/services/states.js');
const ScreensService = require('./src/services/screens.js');
const settings = require('electron-settings');
const Log = require('./src/controllers/log.js');
const Trace = require('./src/controllers/trace.js');
const ATM = require('./src/controllers/atm.js');

let log = new Log();
let trace = new Trace();
let atm = new ATM(settings, log);

let states = new StatesService(settings, log);
let screens = new ScreensService(settings, log);
