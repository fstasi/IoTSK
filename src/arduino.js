const { ArduinoIoTCloud } = require('arduino-iot-js');
const ArduinoIotClient = require('@arduino/arduino-iot-client');

// for the purpose of this demo we are going to connect to a single Thing
const thingId = process.env.THING_ID;

// init the ArduinoIotClient
const client = ArduinoIotClient.ApiClient.instance;
const propertiesV2Api = new ArduinoIotClient.PropertiesV2Api();
const seriesV2Api = new ArduinoIotClient.SeriesV2Api();

// instantiate an global object for things properties.
// It will be populated dynamically using ArduinoIotClient APIs
// and kept in sync via mqtt connection provided by ArduinoIoTCloud
let thingProperties = {}

// list all the properties of a thing
const getThingProperties = () => {
  return propertiesV2Api.propertiesV2List(thingId, {});
}

// get the value for every propertyId passed in the input argument
const getPropertiesLastValues = (propertiesIdArr) => {
  const request = {
    "requests": propertiesIdArr.map(property_id => {
      return { property_id, thing_id: thingId}
    })
  };
  return seriesV2Api.seriesV2BatchQueryRawLastValue(request);
}

// list all the properties of a thing
const getPropertyValue = (propertyName) => {
  return typeof thingProperties[propertyName] !== 'undefined' ? thingProperties[propertyName].value : null;
}

// set the value for a property
const setPropertyValue = (propertyName, newValue) => {
  return ArduinoIoTCloud.sendProperty(thingId, propertyName, newValue);
}

// connect to the Arduino IoT Cloud broker
ArduinoIoTCloud.connect({
  clientId: process.env.IOT_CLIENT_ID,
  clientSecret: process.env.IOT_CLIENT_SECRET,
  onDisconnect: message => {
    console.error(message);
  }
})
.then(async () => {
  console.log("Connected to Arduino IoT Cloud broker");
  
  // use the token to connect with arduino-iot-client
  client.authentications['oauth2'].accessToken = ArduinoIoTCloud.getToken();
  
  // as soon as we have a connection, fetch for existing properties and their values
  const properties = (await getThingProperties()) || [];
  const propertiesValues = (await getPropertiesLastValues(properties.map(p => p.id))).responses || [];

  // set global properties object with the values we just fetched
  thingProperties = properties.reduce((prev, property) => {
      prev[property.variable_name] = {
        id: property.id,
        value: propertiesValues.find(propVal => propVal.property_id === property.id).values[0]
      };
    return prev;
  }, {});


  // register a callback for every property in the object to keep the values updated
  Object.keys(thingProperties).forEach((propertyName) => {
    ArduinoIoTCloud.onPropertyValue(thingId, propertyName, (newValue) => {
      thingProperties[propertyName].value = newValue;
    });
  });
    
})  
.then(() => console.log("Callbacks registered"))
.catch(error => console.log(error));

module.exports = {
  getPropertyValue,
  setPropertyValue,
  getThingProperties
}