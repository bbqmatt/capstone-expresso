const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

db.serialize(function() {
  //db.run(`DROP TABLE Employee`);
  db.run(`CREATE TABLE IF NOT EXISTS Employee
    ( id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    wage INTEGER NOT NULL,
    is_current_employee INTEGER DEFAULT 1);`, error => {
      if (error){
        console.log("Employee table creation error");
      } else {
        console.log("Employee table created");
      }
    });

    //db.run(`DROP TABLE Timesheet`);
    db.run(`CREATE TABLE IF NOT EXISTS Timesheet
      ( id INTEGER PRIMARY KEY,
        hours INTEGER NOT NULL,
        rate INTEGER NOT NULL,
        date INTEGER NOT NULL,
        employee_id INTEGER NOT NULL);`, error => {
          if (error){
            console.log("Timesheet table creation error");
          } else {
            console.log("Timesheet table created");
          }
        });

      //db.run(`DROP TABLE Menu`);
      db.run(`CREATE TABLE IF NOT EXISTS Menu
        (id INTEGER PRIMARY KEY,
          title TEXT NOT NULL);`, error => {
        if (error){
          console.log("Menu table creation error");
        } else {
          console.log("Menu table created");
        }
      });

      //db.run(`DROP TABLE MenuItem`);
      db.run(`CREATE TABLE IF NOT EXISTS MenuItem
      (id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      inventory INTEGER NOT NULL,
      price INTEGER NOT NULL,
      menu_id INTEGER NOT NULL);`, error => {
        if (error){
          console.log("MenuItem table creation error");
        } else {
          console.log("MenuItem table created");
        }
      });

});
