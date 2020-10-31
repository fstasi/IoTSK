# IoTSK

This is a demo project used to programmatically interact with two [Arduino IoT Cloud](https://create.arduino.cc/iot/) Things by taking the properties of the THING_ID_FROM and forward them to  THING_ID_TO, in a simple proxy-like pattern.
It also exposes a simple http server used to programmatically change the properties of the things.

Things can be associated to one or more real device.

The NodeJs application, that acts as the proxy between the Things, is deployed to [Heroku](https://heroku.com).

This project is also intended as a primer for the following software:
- [Arduino iot-js](https://www.npmjs.com/package/arduino-iot-js), used to subscribe to the mqtt broker and being able to read and send data
- [Arduino iot-api JS client](https://www.npmjs.com/package/@arduino/arduino-iot-client), used to interrogate Arduino IoT cloud endpoints 
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli), used to run the NodeJs application locally and deploy it in the cloud

## 👩‍🚀 Pre-requisites

- [Node.js](https://nodejs.org/) version 14 (LTS)

## 🚀 Local development Quickstart

1. Install npm dependencies
    ```sh
    npm i
    ```

2. Create a `.env` file in the project root. _IOT\_CLIENT\_ID_ and _IOT\_CLIENT\_SECRET_ can be generated in the [Arduino IoT Cloud](https://create.arduino.cc/iot/things). _THING\_ID\_FROM_ and _THING\_ID\_TO_ are the IDs of your Things. Those are described in both the sketch file and the Arduino IoT Cloud
    ```sh
    IOT_CLIENT_ID=<arduino iot key>
    IOT_CLIENT_SECRET=<arduino iot secret>
    THING_ID_FROM=<the id of the thing used as source>
    THING_ID_TO=<the id of the thing used as destination>
    ```
    
3. Setup [Heroku](https://heroku.com)
    - Create an account if you don't have one
    - Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
    - login running `heroku login` in your shell
    - run `heroku create` in the project root directory

4. Run your app locally on `http://localhost:3000`
    - via `heroku local`
    - with the provided launch configuration if you are using VSCode
    - via `npm start` 