import { NexecurAPI } from "../Nexecur-Unofficial-API/Controllers/NexecurAPI";
import { AlarmStatus } from "../Nexecur-Unofficial-API/Models/AlarmStatus";

var assert = require('assert');

describe('NexecurAPi integration', function () {
    describe('#saveInDatabase()', function () {
        it('should have correct response', function (done) {
            NexecurAPI.getAlarmStatus((status: AlarmStatus) => {
                switch (status) {
                    case AlarmStatus.Enabled:
                    case AlarmStatus.Disabled:
                        done();
                        break;

                    default:
                        done("Erreur Nexecur-Unofficial-API");
                        break;
                }
            });
        });
    });
});




