# Nexecur Scheduler

This package aims at scheduling repetitive activation and desactivation of Nexecur security system using [unofficial API](https://github.com/baudev/Nexecur-Unofficial-API).

## Installation

1. `git clone https://github.com/quelqun007/NexecureScheduler.git --recurse-submodules`

2. `npm install`

3. Configure the `config.json` file. You could provide the following defaults values:
- `activationHour` : (number 0-23) hour of alarm activation job
- `activationHour` : (number 0-23) hour of alarm desactivation job

Please note that this configuration is just used at launch time and can be modified by runtime configuration through API.

4. Configure the `config.json` file in the Nexecur-Unofficial-API directory. You should provide the following values:
- `id_site`
- `password` (hash)
- `pin` (hash)

5. Configure users id and password in the `users.json` file.

6. `npm start` to run the script

# Notes

Some specific use cases are detailed below :

- you can activate the alarm before the activation hour, it will work as usual : the alarm will be disabled at next desactivation job, following scheduling.

- you can desactivate the alarm before the desactivation job.

- to activate/desactivate your alarm for many days and dont follow the scheduling during this period : add today as an exception date and following days defining the period, and then activate the alarm.

## License

MIT License

Copyright (c) 2018 Baudev, Quelqun007.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Legal
This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by Nexecur or any of its affiliates or subsidiaries. This is an independent and unofficial API. Use at your own risk.