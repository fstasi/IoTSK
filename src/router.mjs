import express from "express";
import { things } from "./arduino.mjs";

const _router = express.Router();

_router.get("/:thingId/properties", function (req, res) {
  const properties = things[req.params.thingId]?.getPropertiesList() || null;
  const message =
    properties === null ? `No known properties` : `properties: ${properties}`;
  res.send(message);
});

_router.get("/:thingId/:propertyName", function (req, res) {
  const value =
    things[req.params.thingId]?.getPropertyValue(req.params.propertyName) ||
    null;
  const message =
    value === null
      ? `${req.params.propertyName} is not a valid property`
      : `${req.params.propertyName} value: ${value}`;
  res.send(message);
});

_router.post("/:thingId/:propertyName", (req, res) => {
  const properties = things[req.params.thingId]?.getPropertiesList() || [];

  if (!properties.includes(req.params.propertyName)) {
    res.send(
      `Cannot set new value for invalid property ${req.params.propertyName}`
    );
    return;
  }

  things[req.params.thingId]
    .setPropertyValue(req.params.propertyName, req.body.value)
    .then(() => {
      res.send(`Set property ${req.params.propertyName} to ${req.body.value}`);
    });
});

export const router = _router;
