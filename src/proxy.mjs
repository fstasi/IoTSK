/**
 * Given an object of things, returns a function that acts as a proxy,
 * forwarding properties from a source thing to properties of destination thing.
 * @param things - a dictionary of Things
 * @returns {function} (thingIdFrom, propertyName, value) - a function that forwards the value of propertyName
 * from the source Thing to the destination Thing.
 *
 * For the purpose of this example, we are going to forward
 * every property of THING_ID_FROM to the corresponding
 * propoerty of THING_ID_TO
 */
export const propertiesProxy = (things) => {
  return (thingIdFrom, propertyName, value) => {
    const thingIdTo = process.env.THING_ID_TO;
    if (thingIdFrom !== process.env.THING_ID_FROM) {
      return;
    }

    // Avoid sending values to not associated things
    if (!things[thingIdTo]) {
      return;
    }

    // Avoid sending a value if the property in the destination thing doesn't exist
    if (!things[thingIdTo]) {
      return;
    }
    things[thingIdTo].setPropertyValue(propertyName, value);
  };
};
