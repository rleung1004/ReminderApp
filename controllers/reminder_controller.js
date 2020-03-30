const fetch = require('node-fetch');
let Database = require("../database");
let coordinates = {lat: undefined, lon: undefined};
let weatherData;

let remindersController = {
  list: (req, res) => {
    res.render('reminder/index', { reminders: Database.cindy.reminders })
  },

  new: (req, res) => {
    res.render('reminder/create')
  },

  listOne: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function(reminder) {
      return reminder.id == reminderToFind; // good test question for students what happens if I put ===
    })
    if (searchResult != undefined) {
      res.render('reminder/single-reminder', { reminderItem: searchResult })
    } else {
      res.render('reminder/index', { reminders: Database.cindy.reminders })
    }
  },

  create: (req, res) => {
    let reminder = {
      id: Database.cindy.reminders.length+1,
      title: req.body.title,
      description: req.body.description,
      completed: false
    }
    Database.cindy.reminders.push(reminder);
    res.redirect('/reminder');
  },

  edit: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function(reminder) {
      return reminder.id == reminderToFind; // Why do you think I chose NOT to use === here?
    })
    res.render('reminder/edit', { reminderItem: searchResult })
    
  },

  update: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function(reminder) {
      if(reminder.id == reminderToFind) {
        reminder.title = req.body.title,
        reminder.description = req.body.description,
        // Why do you think I had to do req.body.completed == "true" below?
        reminder.completed = req.body.completed == "true" 
      }
    });
    res.redirect('/reminder/' + reminderToFind)
  },

  delete: (req, res) => {
    let reminderToFind = req.params.id;
    let reminderIndex = Database.cindy.reminders.findIndex(function(reminder) {
      return reminder.id == reminderToFind; 
    })
    Database.cindy.reminders.splice(reminderIndex, 1);
    res.redirect('/reminder');
  },

  receiveCoordinates: (req, res) => {
      console.log("Received geolocation coordinates.");
      console.log(req.body);
      const data = req.body;
      coordinates.lat = data.lat;
      coordinates.lon = data.lon;
      console.log("Coordinates are now set to", coordinates);
      res.json({
          status: 'success',
          latitude: data.lat,
          longitude: data.lon
      });
  },

  getWeatherData: async (req, res) => {
    const coordinates = req.params.coordinates.split(',');
    const lat = coordinates[0];
    const lon = coordinates[1];
    let api_url = `https://api.darksky.net/forecast/adaec7279bd9fe4d04fac4d6ecd1052b/${lat},${lon}`
    let fetch_response = await fetch(api_url);
    weatherData = await fetch_response.json();
    res.json(weatherData);
  }
}

module.exports = remindersController
