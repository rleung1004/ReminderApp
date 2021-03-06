const fetch = require("node-fetch");
let Database = require("../database");
let currentDate = require("../utility/handyFunctions");
let weatherData;

let remindersController = {
  list: (req, res) => {
    res.render("reminder/index", {
      reminders: Database.cindy.reminders,
      mode: Database.cindy.mode,
    });
  },

  new: (req, res) => {
    res.render("reminder/create");
  },

  listOne: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function (reminder) {
      return reminder.id == reminderToFind; // good test question for students what happens if I put ===
    });
    if (searchResult != undefined) {
      res.render("reminder/single-reminder", { reminderItem: searchResult });
    } else {
      res.render("reminder/index", { reminders: Database.cindy.reminders });
    }
  },

  // added remind date
  create: (req, res) => {
    let current = currentDate();
    // taken from stackoverflow https://stackoverflow.com/questions/19084570/how-to-add-items-to-array-in-nodejs
    let tagDiv = req.body.tag;
    let tags = [];
    if (tagDiv) {
      if (typeof tagDiv === "string") {
        tags.push(tagDiv);
      } else {
        tagDiv.forEach(function (aTag) {
          aTag = aTag.trim();
          if (aTag != "") {
            tags.push(aTag);
          }
        });
      }
    }
    let reminder = {
      id: Database.cindy.reminders.length + 1,
      title: req.body.title,
      description: req.body.description,
      tags: tags,
      remindDate: req.body.remindDate,
      currentDate: req.body.remindDate == current,
      completed: false,
      umbrella: false,
    };
    let date = new Date(reminder.remindDate);
    let time = String(date.getTime());
    time = time.substring(0, time.length - 3);
    time = parseInt(time);

    if (weatherData) {
      weatherData.forEach((day) => {
        // hard coded conversion from PDT to UTC
        let convertedTime = day.time - 25200;
        if (convertedTime === time) {
          if (
            day.icon === "rain" ||
            day.icon === "sleet" ||
            day.icon === "snow"
          ) {
            reminder.umbrella = true;
          }
        }
      });
    }

    Database.cindy.reminders.push(reminder);
    res.redirect("/reminder");
  },

  download: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function (reminder) {
      return reminder.id == reminderToFind;
    });
    var fs = require("fs");
    let reminder = JSON.stringify(Database.cindy.reminders); // converts to string so it can be downloaded
    fs.writeFileSync("test.txt", reminder, "utf8", function (err) {
      console.log(err);
    }); // creates new file called test.txt and fills it with the contents of the reminders
    res.download("test.txt", (filename = "reminders.txt")); // downloads the file made in the last line with the name "reminders.txt"
  },

  import: (req, res) => {
    // let reminderToFind = req.params.id;
    // let searchResult = Database.cindy.reminders.find(function(reminder) {
    //   return reminder.id == reminderToFind;
    // })
    // console.log("I WAS CALLED");
    // res.redirect('/reminder');
    res.render("reminder/import");
  },

  importpost: (req, res) => {
    let importContent = req.body;
    Database.cindy.reminders.push(importContent[0]);
  },
  edit: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function (reminder) {
      return reminder.id == reminderToFind; // Why do you think I chose NOT to use === here?
    });
    res.render("reminder/edit", { reminderItem: searchResult });
  },

  update: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function (reminder) {
      if (reminder.id == reminderToFind) {
        let tagDiv = req.body.tag;
        let tags = [];
        if (tagDiv) {
          if (typeof tagDiv === "string") {
            tags.push(tagDiv);
          } else {
            tagDiv.forEach(function (aTag) {
              aTag = aTag.trim();
              if (aTag != "") {
                tags.push(aTag);
              }
            });
          }
        }
        let date = new Date(reminder.remindDate);
        let time = String(date.getTime());
        time = time.substring(0, time.length - 3);
        time = parseInt(time);

        (reminder.title = req.body.title),
          (reminder.description = req.body.description),
          (reminder.remindDate = req.body.remindDate),
          // Why do you think I had to do req.body.completed == "true" below?
          (reminder.tags = tags),
          (reminder.completed = req.body.completed == true);

        if (weatherData) {
          weatherData.forEach((day) => {
            // hard coded conversion from PDT to UTC
            let convertedTime = day.time - 25200;
            if (convertedTime === time) {
              if (
                day.icon === "rain" ||
                day.icon === "sleet" ||
                day.icon === "snow"
              ) {
                reminder.umbrella = true;
              }
            }
          });
        }
      }
    });

    res.redirect("/reminder/" + reminderToFind);
  },

  delete: (req, res) => {
    let reminderToFind = req.params.id;
    let reminderIndex = Database.cindy.reminders.findIndex(function (reminder) {
      return reminder.id == reminderToFind;
    });
    Database.cindy.reminders.splice(reminderIndex, 1);
    res.redirect("/reminder");
  },

  complete: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function (reminder) {
      if (reminder.id == reminderToFind) {
        if (reminder.completed == true) {
          reminder.completed = false;
        } else {
          reminder.completed = true;
        }
        res.redirect("/reminder");
      }
    });
  },

  getWeatherData: async (req, res) => {
    const coordinates = req.params.coordinates.split(",");
    const lat = coordinates[0];
    const lon = coordinates[1];
    let api_url = `https://api.darksky.net/forecast/adaec7279bd9fe4d04fac4d6ecd1052b/${lat},${lon}`;
    let fetch_response = await fetch(api_url);
    weatherData = await fetch_response.json();
    console.log(weatherData.timezone);
    weatherData = weatherData.daily.data;
    res.json(weatherData);
  },

  authenticate: async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    username = username.toLowerCase();
    let user = Database[username];

    if (user && password === user.password) {
      res.redirect("/reminder");
      console.log("successfullly logged in user: " + username);
    } else if (password !== user.password) {
      res.redirect("/reminder/errorAuth");
      console.log("username and password were incorrect!");
    } else {
      res.redirect("/reminder/errorAuth");
      console.log("user does not exist! Register for an account first!");
    }
  },

  // to register a new user
  register: async (req, res) => {
    let username = req.body.newUsername;
    let password = req.body.newPassword;
    let secondPassword = req.body.newPasswordSecond;
    username = username.toLowerCase();

    if (
      password == secondPassword &&
      username !== "" &&
      password !== "" &&
      Database[username] === undefined
    ) {
      Database[username] = {
        reminders: [],
        password: password,
      };
      res.redirect("/reminder");
      console.log(
        "created new user!\nUsername: " + username + "\nPassword: " + password
      );
    } else if (password !== secondPassword) {
      res.redirect("/reminder/errorAuth");
      console.log("passwords were not the same! Try again!");
    } else {
      res.redirect("/reminder/errorAuth");
      console.log(
        "You did not register correctly! Username already taken! Try again!"
      );
    }
  },

  /* 
  // does not work... ask Armaan
  deleteSelected: (req, res) => {
    let check_box_array = document.getElementsByClassName("custom-control-input");
    for (i = 0; i < check_box_array.length; i++) {
      if (check_box_array[i] = true){
        remindersController.delete
      }
    }
    res.redirect("/reminder")
  } */
};

module.exports = remindersController;
