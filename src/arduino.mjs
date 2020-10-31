import { ArduinoIoTCloud } from "arduino-iot-js";
import ArduinoIotClient from "@arduino/arduino-iot-client";
import { thing } from "./thing.mjs";
import { propertiesProxy } from "./proxy.mjs";

// Instantiate the dictionary of connected things. Will be populated later on.
// Exported as used by the router to interrogate Things
export const things = {
  [process.env.THING_ID_FROM]: null,
  [process.env.THING_ID_TO]: null,
};

// Init the ArduinoIotClient
const client = ArduinoIotClient.ApiClient.instance;
const propertiesV2Api = new ArduinoIotClient.PropertiesV2Api();
const seriesV2Api = new ArduinoIotClient.SeriesV2Api();

// List all the properties of a thing
const getThingProperties = (thingId) => {
  return propertiesV2Api.propertiesV2List(thingId, {});
};

// Get the value for every propertyId passed in the input argument
const getThingPropertiesLastValues = (thingId, propertiesIdArr) => {
  const request = {
    requests: propertiesIdArr.map((property_id) => {
      return { property_id, thing_id: thingId };
    }),
  };
  return seriesV2Api.seriesV2BatchQueryRawLastValue(request);
};

// Connect to the Arduino IoT Cloud broker
ArduinoIoTCloud.connect({
  clientId: process.env.IOT_CLIENT_ID,
  clientSecret: process.env.IOT_CLIENT_SECRET,
  onDisconnect: (message) => {
    console.error(message);
  },
})
  .then(async () => {
    console.log("Connected to Arduino IoT Cloud broker");

    // Use the token to connect with arduino-iot-client
    client.authentications["oauth2"].accessToken = ArduinoIoTCloud.getToken();

    // Instantiate the proxy, passing the dictionary of connected things
    const proxy = propertiesProxy(things);

    await Promise.all([thing(
      process.env.THING_ID_FROM,
      ArduinoIoTCloud,
      getThingProperties,
      getThingPropertiesLastValues,
      proxy
    ), thing(
      process.env.THING_ID_TO,
      ArduinoIoTCloud,
      getThingProperties,
      getThingPropertiesLastValues,
      proxy
    )]).then(([thingFrom, thingTo]) => {
      things[process.env.THING_ID_FROM] = thingFrom;
      things[process.env.THING_ID_TO] = thingTo;
    });
  })
  .then(() => console.log("Callbacks registered"))
  .catch((error) => console.error(error));
