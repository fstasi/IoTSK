import express from "express";
import {router} from "./router.mjs";

const app = express();

app.use(express.json());
app.use("/", router);

// start the server
app.listen(3000, function () {
  console.log("App listening on port 3000!");
});
