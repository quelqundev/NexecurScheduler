import { Configuration } from "./Configuration";
import { Log } from "./LogUtil";
import { AlarmStatus } from "../Nexecur-Unofficial-API/Models/AlarmStatus";
import { SMSAlert } from "./SMSAlert";
import { NexecurAPI } from "../Nexecur-Unofficial-API/Controllers/NexecurAPI";
import { NoplanningDate } from "./NoplanningDate";
import { UndefinedAPIError } from "../Nexecur-Unofficial-API/Models/Errors/UndefinedAPIError";
import { OrderAlarmError } from "../Nexecur-Unofficial-API/Models/Errors/OrderAlarmError";

/**
 * Class managing automatic tasking of alarm activation and desactivation based on Node-Schedule package :
 * https://github.com/node-schedule/node-schedule/blob/master/README.md
 */
export class TaskScheduler {
    /**
     * Node-Schedule object handling activation jobs
     */
    activationSchedule;
    /**
     * Node-Schedule object handling desactivation jobs
     */
    desactivationSchedule;
    /**
     * ScheduleConfiguration
     */
    scheduleConfig;

    constructor(scheduleConfig: Configuration) {
        var schedule = require('node-schedule');
        this.scheduleConfig = scheduleConfig;

        /**
         * Alarm activation task
         */
        this.activationSchedule = schedule.scheduleJob({ hour: scheduleConfig.activationHour }, function () {
            Log.info("--- Activation schedule start ---");

            let postcheckCallback = (status: AlarmStatus) => {
                switch (status) {
                    case AlarmStatus.Enabled:
                        Log.debug('  Alarm state : ENABLED');
                        Log.info('  Activation reussie !');
                        break;
                    case AlarmStatus.Disabled:
                        //error : alarm is still not enabled
                        Log.debug('  Alarm state : DISABLED');
                        Log.info('  Activation echouee !');
                        SMSAlert.sendSMSAlert(`ACTIVATION ECHOUEE a ${scheduleConfig.activationHour}h. Alarme encore DESACTIVEE.`);
                        break;
                    default:
                        //error : status is not an AlarmStatus
                        break;
                }
                Log.info("--- Activation schedule end ---");
            };

            let enableCallback = () => {
                //Check system status after the try
                Log.debug('Checking alarm status...');
                NexecurAPI.getAlarmStatus().then((res: AlarmStatus) => {
                    postcheckCallback(res);
                }).catch((err: UndefinedAPIError) => {
                    Log.info(err.name + ' - ' + err.message)
                });
            };

            let precheckCallback = ((status: AlarmStatus) => {
                switch (status) {
                    case AlarmStatus.Disabled:
                        Log.debug(' Alarm state : DISABLED');
                        //Try to enable alarm
                        Log.debug('  Trying to enable alarm...');
                        NexecurAPI.enableAlarm().then(() => {
                            enableCallback();
                        }).catch((err: OrderAlarmError) => {
                            Log.info(err.name + ' - ' + err.message)
                        });
                        break;
                    case AlarmStatus.Enabled:
                        Log.debug(' Alarm state : ENABLED');
                        //Specific case : alarm already enabled but consider it as normal
                        break;
                    default:
                        //error : status is not an AlarmStatus
                        break;
                }
            });

            //determine if we should activate alarm today or not
            NoplanningDate.isTodayANoplanningDate((isANoplanningDate: boolean) => {
                Log.debug("  isANoplanningDate : " + isANoplanningDate);
                if (isANoplanningDate == true) {
                    //we should not activate the security system...
                    Log.info("  Today is an exception, dont activate alarm");
                    //...and then dont desactivate it next time
                    this.desactivationSchedule.cancelNext();
                } else {
                    //Check system status before trying to enable
                    Log.debug("  checking alarm status...");
                    NexecurAPI.getAlarmStatus().then((result: AlarmStatus) => {
                        precheckCallback(result);
                    }).catch((err: UndefinedAPIError) => {
                        Log.info(err.name + ' - ' + err.message)
                    });
                }
            });


        });

        /**
         * Alarm desactivation task
         */
        this.desactivationSchedule = schedule.scheduleJob({ hour: scheduleConfig.desactivationHour }, function () {
            Log.info("--- Desactivation schedule start ---");

            let postcheckCallback = (status: AlarmStatus) => {
                switch (status) {
                    case AlarmStatus.Disabled:
                        Log.debug(' Alarm state : DISABLED');
                        Log.info(' Desactivation reussie !');
                        break;
                    case AlarmStatus.Enabled:
                        Log.debug(' Alarm state : ENABLED');
                        Log.info(' Desactivation echouee...');
                        //error : alarm is still enabled
                        SMSAlert.sendSMSAlert(`URGENT ! DESACTIVATION ECHOUEE a ${scheduleConfig.desactivationHour}h. Alarme encore ACTIVEE. Veuillez utiliser l'application Mon Nexecur pour desarmer.`);
                        break;
                    default:
                        //error : status is not an AlarmStatus
                        break;
                }
                Log.info("--- Desactivation schedule end ---");
            };

            let disableCallback = () => {
                //Check system status after the try
                Log.debug(' Checking alarm status');
                NexecurAPI.getAlarmStatus().then((result: AlarmStatus) => {
                    postcheckCallback(result);
                }).catch((err: UndefinedAPIError) => {
                    Log.info(err.name + ' - ' + err.message)
                });
            };

            let precheckCallback = ((status: AlarmStatus) => {
                switch (status) {
                    case AlarmStatus.Enabled:
                        Log.debug(' Alarm state : ENABLED');
                        //Try to disable alarm
                        Log.debug(' Trying to desactivate alarm...');
                        NexecurAPI.disableAlarm().then(() => {
                            disableCallback();
                        }).catch((err: OrderAlarmError) => {
                            Log.info(err.name + ' - ' + err.message)
                        });
                        break;
                    case AlarmStatus.Disabled:
                        Log.debug(' Alarm state : DISABLED');
                        //Specific case : alarm already disabled
                        break;
                    default:
                        //error : status is not an AlarmStatus
                        break;
                }
            });

            //Check system status before trying to enable
            Log.debug(' Checking alarm status');
            NexecurAPI.getAlarmStatus().then((result: AlarmStatus) => {
                precheckCallback(result);
            }).catch((err: UndefinedAPIError) => {
                Log.info(err.name + ' - ' + err.message)
            });
        });
    }
}

