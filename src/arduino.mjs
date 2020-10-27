import { ArduinoIoTCloud } from "arduino-iot-js";
import ArduinoIotClient from "@arduino/arduino-iot-client";
import { thing } from "./thing.mjs";

// init the ArduinoIotClient
const client = ArduinoIotClient.ApiClient.instance;
const propertiesV2Api = new ArduinoIotClient.PropertiesV2Api();
const seriesV2Api = new ArduinoIotClient.SeriesV2Api();

// list all the properties of a thing
const getThingProperties = (thingId) => {
  return propertiesV2Api.propertiesV2List(thingId, {});
};

// get the value for every propertyId passed in the input argument
const getPropertiesLastValues = (thingId, propertiesIdArr) => {
  const request = {
    requests: propertiesIdArr.map((property_id) => {
      return { property_id, thing_id: thingId };
    }),
  };
  return seriesV2Api.seriesV2BatchQueryRawLastValue(request);
};

const thingsProxyConfig = {
  [process.env.THING_ID_FROM]: {
    'property': {
      toThing : '',
      toProperty: ''
    }
  }
}

const proxyThingProperty = (thingId, propertyName, value) => {

  // skip things or properties not defined in the proxyconfig
  if (!thingsProxyConfig[thingId] || !thingsProxyConfig[thingId][property]) {
    return;
  }

  const forwardThingId = thingsProxyConfig[thingId][propertyName].toThing;
  const toProperty = thingsProxyConfig[thingId][propertyName].toProperty;

  // avoid sending values to not associated things
  if (!things[forwardThingId]) {
    return;
  }

  things[forwardThingId].setPropertyValue(toProperty, value);
}

export const things = {
  [process.env.THING_ID_FROM]: null,
  [process.env.THING_ID_TO]: null,
};

// connect to the Arduino IoT Cloud broker
ArduinoIoTCloud.connect({
  clientId: process.env.IOT_CLIENT_ID,
  clientSecret: process.env.IOT_CLIENT_SECRET,
  onDisconnect: (message) => {
    console.error(message);
  },
})
  .then(async () => {
    console.log("Connected to Arduino IoT Cloud broker");

    // use the token to connect with arduino-iot-client
    client.authentications["oauth2"].accessToken = ArduinoIoTCloud.getToken();

    things[process.env.THING_ID_FROM] = await thing(
      process.env.THING_ID_FROM,
      getThingProperties,
      getPropertiesLastValues,
      proxyThingProperty
    );
    things[process.env.THING_ID_TO] = await thing(
      process.env.THING_ID_TO,
      getThingProperties,
      getPropertiesLastValues,
      proxyThingProperty
    );
  })
  .then(() => console.log("Callbacks registered"))
  .catch((error) => console.log(error));
