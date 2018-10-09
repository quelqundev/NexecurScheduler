import { AlarmStatus } from "./Nexecur-Unofficial-API/Models/AlarmStatus";
import { NexecurAPI } from "./Nexecur-Unofficial-API/Controllers/NexecurAPI";
import { DatabaseContext } from "./Models/DatabaseContext";
import { NoplanningDate } from "./Models/NoplanningDate";

//https://github.com/node-schedule/node-schedule/blob/master/README.md
var schedule = require('node-schedule');    

//https://www.npmjs.com/package/simple-node-logger
// const opts = {
//   errorEventName:'error',
//   logDirectory:'./logs', // NOTE: folder must exist and be writable...
//   fileNamePattern:'roll-<DATE>.log',
//   dateFormat:'YYYY.MM'
// };
// const log = require('simple-node-logger').createRollingFileLogger( opts );
// log.info('Alarme activée');  //trace, debug, info, warn, error and fatal

/* ACTIVATION ALARME
    1 - verifier alarme est désactivée
        1.1 - si alarme deja activée, alors notifier propriétaire ? et ne pas activer alarme (aller au 3)
        1.2 - si alarme non activée, alors activer alarme (aller au 2)
    2 - finalement verifier que l'alarme est activée
        2.1 - si alarme n'est pas activée, alors notifier propriétaire (aller au 3)
    3 - terminer
*/

/* DESACTIVATION ALARME
  1 - verifier alarme est activée
      1.1 - si alarme non activée, alors notifier propriétaire ? et ne pas activer alarme
      1.2 - si alarme activée, alors désactiver alarme
  2 - finalement verifier que l'alarme est désactivée
      2.1 - si alarme n'est pas désactivée, alors notifier propriétaire (aller au 3)
  3 - terminer
*/

var j = schedule.scheduleJob({second: 0}, function(){
    NexecurAPI.getAlarmStatus((status: AlarmStatus) => {
        switch (status) {
            case AlarmStatus.Enabled:
                console.log('Alarme ACTIVEE');
                break;
            
            case AlarmStatus.Disabled:
                console.log('Alarme DESACTIVEE');
                break;
        
            default:
                break;
        }
    });
  });


