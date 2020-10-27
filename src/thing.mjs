export const thing = async (thingId, getThingProperties, getPropertiesLastValues, proxyThingProperty) => {
  // instantiate an object for thing properties.
  // It will be populated dynamically using ArduinoIotClient APIs
  // and kept in sync via mqtt connection provided by ArduinoIoTCloud
  let thingProperties = {};
  const properties = (await getThingProperties(thingId)) || [];
  const propertiesValues =
    (
      await getPropertiesLastValues(
        thingId,
        properties.map((p) => p.id)
      )
    ).responses || [];

  // set thingProperties with the values just fetched
  thingProperties = properties.reduce((prev, property) => {
    prev[property.variable_name] = {
      id: property.id,
      value: propertiesValues.find(
        (propVal) => propVal.property_id === property.id
      ).values[0],
    };
    return prev;
  }, {});

  // register a callback for every property in the object to keep the values updated
  Object.keys(thingProperties).forEach((propertyName) => {
    ArduinoIoTCloud.onPropertyValue(thingId, propertyName, (newValue) => {
      thingProperties[propertyName].value = newValue;

      // invoke the proxy callback
      proxyThingProperty(thingId, propertyName, newValue)
    });
  });

  return {
    // returns all the properties of the thing
    getPropertyValue(propertyName) {
      return typeof thingProperties[propertyName] !== "undefined"
        ? thingProperties[propertyName].value
        : null;
    },
    // set the value for a property
    setPropertyValue(propertyName, newValue) {
      return ArduinoIoTCloud.sendProperty(thingId, propertyName, newValue);
    },
  };
};