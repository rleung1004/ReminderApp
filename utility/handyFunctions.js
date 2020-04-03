function currentDate() {
    let date = Date.now();
      let date_object = new Date(date);
      let day = ("0" + date_object.getDate()).slice(-2);
      let month = ("0" + (date_object.getMonth() + 1)).slice(-2);
      let year = date_object.getFullYear();
      return year + "-" + month + "-" + day;
}


module.exports = currentDate;