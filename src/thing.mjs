/**
 * A closure rapresenting a Thing. Returns an object with methods to read a write Thing properties
 * @param thingId - id of the thing
 * @param ArduinoIoTCloud - reference to ArduinoIoTCloud, used to connect with MQTT broker
 * @param getThingProperties - function used to get the properties of the thing
 * @param getPropertiesLastValues - function used to get the last values of the properties
 * @param proxyThingProperty - proxy function to call when a property changes
 * @returns {function} getPropertiesList() - lists the properties of the Thing
 * @returns {function} getPropertyValue(propertyName) - returns the value for the given property
 * @returns {function} setPropertyValue(propertyName, newValue) - sends newValue to the given property
 */
export const thing = async (
  thingId,
  ArduinoIoTCloud,
  getThingProperties,
  getPropertiesLastValues,
  proxyThingProperty
) => {
  // Instantiate an object for thing properties.
  // It will be populated dynamically using getThingProperties/getPropertiesLastValues
  // and kept in sync via mqtt by ArduinoIoTCloud
  let thingProperties = {};
  const properties = (await getThingProperties(thingId)) || [];
  const propertiesValues =
    (
      await getPropertiesLastValues(
        thingId,
        properties.map((p) => p.id)
      )
    ).responses || [];

  // Set thingProperties with the values just fetched
  thingProperties = properties.reduce((prev, property) => {
    prev[property.variable_name] = {
      id: property.id,
      value: propertiesValues.find(
        (propVal) => propVal.property_id === property.id
      ).values[0],
    };
    return prev;
  }, {});

  // Register a callback for every property in the object to keep the values updated
  Object.keys(thingProperties).forEach((propertyName) => {
    console.log(`${thingId} - register callback for ${propertyName}`);

    ArduinoIoTCloud.onPropertyValue(thingId, propertyName, (newValue) => {
      console.log(`${thingId} - property ${propertyName} changed`);
      thingProperties[propertyName].value = newValue;

      // Invoke the proxy callback
      proxyThingProperty(thingId, propertyName, newValue);
    });
  });

  return {
    // Get the array of known properties names
    getPropertiesList() {
      return Object.keys(thingProperties);
    },
    // Get the value of a property
    getPropertyValue(propertyName) {
      return typeof thingProperties[propertyName] !== "undefined"
        ? thingProperties[propertyName].value
        : null;
    },
    // Set the value for a property
    setPropertyValue(propertyName, newValue) {
      console.log(`${thingId} - writing ${propertyName}, value: ${newValue}`);
      return ArduinoIoTCloud.sendProperty(thingId, propertyName, newValue);
    },
  };
};
