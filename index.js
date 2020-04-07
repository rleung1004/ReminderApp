const express = require("express");
const app = express();
const ejsLayouts = require("express-ejs-layouts");
const reminderController = require("./controllers/reminder_controller");

app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(ejsLayouts);

app.set("view engine", "ejs");

// Routes start here

// This route does not work right now
// app.get("/reminder/import", reminderController.import)
app.get("/reminder/import", reminderController.import)

app.post("/reminder/importpost", reminderController.importpost)

app.get("/reminder/:id/download", reminderController.download)

app.get("/reminder", reminderController.list);

app.get("/reminder/new", reminderController.new);

app.get("/reminder/:id", reminderController.listOne);

app.get("/reminder/:id/edit", reminderController.edit);

app.post("/reminder/", reminderController.create);

app.post("/reminder/update/:id", reminderController.update); // suggestion for class: look into put and post

app.post("/reminder/delete/:id", reminderController.delete);

app.post("/reminder/complete/:id", reminderController.complete);

app.get("/weather/:coordinates", reminderController.getWeatherData);

app.post("/reminder/authenticate", reminderController.authenticate);

app.post("/reminder/register", reminderController.register);

/* /// does not work... ask Armaan
app.post("/reminder/deleteSelected/:id", reminderController.deleteSelected) */

app.listen(3000, function () {
  console.log(
    "Server running. Visit: localhost:3000/reminder in your browser 🚀"
  );
});
