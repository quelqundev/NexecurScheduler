import { SMSConfig, FreeAccount } from "./SMSConfig";


export class SMSAlert {

    static accounts: Array<FreeAccount>;

    constructor() {
        let config: SMSConfig = require("./../smsconfig.json");
        SMSAlert.accounts = config.freeaccounts;
    }

    static sendSMSAlert(msg: string) {
        var sms = require('free-mobile-sms-api');

        //configuration
        sms.on('sms:error', function (e) {
            console.log(e.code + ": " + e.msg);
        });

        sms.on('sms:success', function (data) {
            console.log("Success! :D");
        });

        //for each free account
        if (SMSAlert.accounts.length > 0) {
            SMSAlert.accounts.forEach((account: FreeAccount) => {
                sms.account(account.id, account.key);
                sms.send(encodeURI(msg));
            });
        } else {
            console.log("You didnt configured your free account into the smsconfig.json file. We can't send SMS.")
        }

    }
}