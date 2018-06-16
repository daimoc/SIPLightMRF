# SIPLightMRF
Simple customisable media player and recorder SIP endpoint

## Synopsis

This project is a SIP Video PLayer /Recorder. It uses [drachtio](https://github.com/davehorton/drachtio) for SIP signaling and [FFMPEG](https://www.kurento.org/) for the Media manipulation.

## Motivation

This recorder is made to connect to any classic SIP endpoint like Softphone, PABX or MCU and record remote stream.
It was firstly designed to work with Asterisk and it works with it.

## Installation on Ubuntu 14.04


First , install  NodeJS
```bash
sudo apt-get install nodejs
```

Then install, [drachtio-server](https://github.com/davehorton/drachtio-server) :

```bash
git clone git://github.com/davehorton/drachtio-server.git && cd drachtio-server
git submodule update --init --recursive
./bootstrap.sh
mkdir build && cd $_
../configure CPPFLAGS='-DNDEBUG'
make
sudo make install
```

Then install FFMPEG
```bash
apt-get install ffmpeg
```


And finally, install node modules :
```bash
npm install
```

## Server Configuration
Change config.serverPublicIP in file config.js to expose external  public IP used for SIP sdp generation.
* config.ffmpegPath Path to your FFMPEG bin

## To run
```bash
node server.js
```

* Start a record with Send HTTP GET request  https://localhost:8443/sip/invite?to=bob@192.168.0.17&from=recorder@127.0.0.1&logoUrl=http://dfdfdffd/
  return callid
* Stop a record with Send HTTP GET request  https://localhost:8443/sip/bye?callid=XXXXXXXXXXX
* Stop all records with Send HTTP GET request  https://localhost:8443/sip/globalbye
* Get recorded file URL https://localhost:8443/record/callid

* Get current record list  https://localhost:8443/sip/status
* Get all record list  https://localhost:8443/record/status


## Contributors
Damien Fétis

## License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
