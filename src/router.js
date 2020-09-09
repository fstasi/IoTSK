const express = require('express');
const router = express.Router()

const arduino = require('./arduino');

router.get('/:propertyName', function(req, res) {
  const value = arduino.getPropertyValue(req.params.propertyName);
  const message = value === null ? `${req.params.propertyName} is not a valid property` : 
        `${req.params.propertyName} value: ${arduino.getPropertyValue(req.params.propertyName)}`
  res.send(message);
});

router.post('/:propertyName', (req, res) => {
  const oldValue = arduino.getPropertyValue(req.params.propertyName);

  if (oldValue === null) {
    res.send(`Cannot set new value for invalid property ${req.params.propertyName}`);
    return;
  }

  arduino.setPropertyValue(req.params.propertyName, req.body.value).then(() => {
    res.send(`Set property ${req.params.propertyName} to ${req.body.value}`);
  })
});

module.exports = router;