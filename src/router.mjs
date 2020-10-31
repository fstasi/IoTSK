import express from "express";
import { things } from "./arduino.mjs";

const _router = express.Router();

/**
 * @swagger
 * /{thingId}/properties:
 *   get:
 *     description: Get all the properties for the given Thing
 *     parameters:
 *      - name: thingId
 *        in: path
 *        description: ID of the Thing to return properties from
 *        required: true
 *        type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Thing properties
 *       404:
 *         description: Thing is not registered
 */
_router.get("/:thingId/properties", function (req, res) {
  if (!things[req.params.thingId]) {
    res.status(404).send(`Thing ${req.params.thingId} has not been registered`);
    return;
  }
  const properties = things[req.params.thingId].getPropertiesList() || [];

  res.json({
    properties,
  });
});

/**
 * @swagger
 * /{thingId}/{propertyName}:
 *   get:
 *     description: Get the value of a specific property for the given Thing
 *     parameters:
 *      - name: thingId
 *        in: path
 *        description: ID of the Thing to return properties from
 *        required: true
 *        type: string
 *      - name: propertyName
 *        in: path
 *        description: The name of the property
 *        required: true
 *        type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The value of the given property
 *       404:
 *         description: Thing is not registered or has not the given property
 */
_router.get("/:thingId/:propertyName", function (req, res) {
  if (!things[req.params.thingId]) {
    res.status(404).send(`Thing ${req.params.thingId} has not been registered`);
    return;
  }

  const properties = things[req.params.thingId].getPropertiesList() || [];
  if (!properties.includes(req.params.propertyName)) {
    res
      .status(404)
      .send(
        `Invalid Property "${req.params.propertyName}" for Thing ${req.params.thingId}`
      );
    return;
  }

  const value =
    things[req.params.thingId].getPropertyValue(req.params.propertyName) ||
    null;
  res.json({
    [req.params.propertyName]: value,
  });
});

/**
 * @swagger
 * /{thingId}/{propertyName}:
 *   post:
 *     description: Get the value of a specific property for the given Thing
 *     parameters:
 *      - name: thingId
 *        in: path
 *        description: ID of the Thing to write the property value
 *        required: true
 *        type: string
 *      - name: propertyName
 *        in: path
 *        description: The name of the property
 *        required: true
 *        type: string
 *      - name: value
 *        in: body
 *        description: The new value of the property
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            value:
 *              type: string
 *              description: Use the correct type (int, float, bool, string) accordingly to the property.
 *          required:
 *            - value
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The value of the given has been updated
 *       404:
 *         description: Thing is not registered or has not the given property
 */
_router.post("/:thingId/:propertyName", (req, res) => {
  if (!things[req.params.thingId]) {
    res.status(404).send(`Thing ${req.params.thingId} has not been registered`);
    return;
  }

  const properties = things[req.params.thingId].getPropertiesList() || [];
  if (!properties.includes(req.params.propertyName)) {
    res
      .status(404)
      .send(
        `Invalid Property "${req.params.propertyName}" for Thing ${req.params.thingId}`
      );
    return;
  }

  things[req.params.thingId]
    .setPropertyValue(req.params.propertyName, req.body.value)
    .then(() => {
      res.json({
        [req.params.propertyName]: req.body.value,
      });
    });
});

export const router = _router;
