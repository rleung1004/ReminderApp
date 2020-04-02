let Database = require("../database");

let remindersController = {
  list: (req, res) => {
    res.render('reminder/index', { reminders: Database.cindy.reminders, mode: Database.cindy.mode })
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

  // added remind date
  create: (req, res) => {
    function currentDate() {
      let date = Date.now();
        let date_object = new Date(date);
        let day = ("0" + date_object.getDate()).slice(-2);
        let month = ("0" + (date_object.getMonth() + 1)).slice(-2);
        let year = date_object.getFullYear();
        return year + "-" + month + "-" + day;}
    
        let current = currentDate();

    let reminder = {
      id: Database.cindy.reminders.length+1,
      title: req.body.title,
      description: req.body.description,
      remindDate: req.body.remindDate,
      currentDate: req.body.remindDate == current,
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
        reminder.remindDate = req.body.remindDate,
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

  complete: (req, res) => {
    let reminderToFind = req.params.id;
    let searchResult = Database.cindy.reminders.find(function(reminder) {
      if (reminder.id == reminderToFind) {
        if (reminder.completed == true) {
          reminder.completed = false;
        }
        else {
          reminder.completed = true;
        };
        res.redirect("/reminder");
      }
    })
  },

/*   background: (req, res) => {
    let mode = Database.cindy.mode;
    if (req.body.className == "night") {
        mode = false;
    }
    else {
      mode = true;
    }
    res.render("/reminder");
  },
   */


  /* // does not work... ask Armaan
  deleteSelected: (req, res) => {
    let check_box_array = document.getElementsByClassName("custom-control-input");
    for (i = 0; i < check_box_array.length; i++) {
      if (check_box_array[i] = true){
        remindersController.delete
      }
    }
    res.redirect("/reminder")
  }
 */

}


module.exports = remindersController
