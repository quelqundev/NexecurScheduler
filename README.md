# Nexecur Scheduler

![GitHub release](https://img.shields.io/github/release/quelqundev/NexecurScheduler.svg)
![GitHub appveyor](https://img.shields.io/travis/com/quelqundev/NexecurScheduler.svg)
[![GitHub issues](https://img.shields.io/github/issues/quelqundev/NexecurScheduler.svg)](https://github.com/quelqundev/NexecurScheduler/issues)
[![GitHub license](https://img.shields.io/github/license/quelqundev/NexecurScheduler.svg)](https://github.com/quelqundev/NexecurScheduler)

This package aims at scheduling repetitive activation and desactivation of Nexecur security system using [unofficial API](https://github.com/baudev/Nexecur-Unofficial-API).

## Installation

1. `git clone https://github.com/quelqun007/NexecureScheduler.git --recurse-submodules`

2. `npm install`

3. Configure the `config.json` file. You could provide the following defaults values:
- `activationHour` : (number 0-23) hour of alarm activation job
- `activationHour` : (number 0-23) hour of alarm desactivation job

Please note that this configuration is just used at launch time and can be modified by runtime configuration through API.

4. Configure the `config.json` file in the Nexecur-Unofficial-API directory. You should provide the following values :
- `id_site` (also called wiring code)
- `password` (also called PIN)

5. Configure users id and password in the `users.json` file.

6. Configure free account id and key in the `smsconfig.json` file : `{"id":13245678,"key": "examplekey"}`

7. `npm start` to run the script

# Notes

Some specific use cases are detailed below :

- you can activate the alarm before the activation hour, it will work as usual : the alarm will be disabled at next desactivation job, following scheduling.

- you can desactivate the alarm before the desactivation job.

- to activate/desactivate your alarm for many days and dont follow the scheduling during this period : add today as an exception date and following days defining the period, and then activate the alarm.

### Legal
This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by Nexecur or any of its affiliates or subsidiaries. This is an independent and unofficial API. Use at your own risk.
