import express from "express";
import { router } from "./router.mjs";
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc'

const port = process.env.PORT || 3000;

// Setup Swagger
const swaggerDefinition = {
  info: {
    title: 'IoTSk',
    version: '1.0.0',
  },
  host: `localhost:${port}`,
};
const options = {
  swaggerDefinition,
  apis: ['**/router.mjs'],
};
const swaggerSpec = swaggerJSDoc(options);

const app = express();

app.use(express.json());

// Serve Swagger documentation on /doc
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Handle all other routes
app.use("/", router);

// Start the server
app.listen(port, function () {
  console.log(`App listening on port ${port}`);
});
