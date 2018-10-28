import { Configuration } from "./Models/Configuration";
import { TaskScheduler } from "./Models/TaskScheduler";
import { WebServer } from "./Models/WebServer";

/******************************************************************************/
/*                              TASK SCHEDULER                                */
/******************************************************************************/
//load configuration
var scheduleConfig: Configuration = require('./config.json');
scheduleConfig.activationHour = scheduleConfig.activationHour || 21;
scheduleConfig.desactivationHour = scheduleConfig.desactivationHour || 6;
//start scheduling
let ts = new TaskScheduler(scheduleConfig);

/******************************************************************************/
/*                              SERVER LAUNCH                                 */
/******************************************************************************/
let ws = new WebServer(ts);
ws.start();
