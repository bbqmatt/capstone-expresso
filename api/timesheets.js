const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const pp = x => JSON.stringify(x, null, 2);

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (error, tsheet) => {
    if (error) {
      next(error);
    } else if (tsheet) {
      req.timesheet = tsheet;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $ID';
  const values = { $ID: req.employee.id};

  //console.log(`>>>>>> Timesheet GET - req.employee.id  is ${pp(values)}`);

  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours,
          rate = req.body.timesheet.rate,
          date = req.body.timesheet.date,
          employeeId = req.employee.id;

    const tsheetsql = 'SELECT * FROM Employee WHERE Employee.id = $ID';
    const values = {$ID: employeeId};

    //console.log(`>>>>>> req.employee.id  is ${pp(values)}`);

    db.get(tsheetsql, values, (error, emp) => {
      if (error) {
        return res.sendStatus(404);
      } else {
        if (!hours || !rate || !date || !employeeId) {
          return res.sendStatus(400);
        };

        const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id)' +
                'VALUES ($hours, $rate, $date, $employeeId)';
        const values = {
          $hours: hours,
          $rate: rate,
          $date: date,
          $employeeId: employeeId
        };

        //console.log(`>>>>>> values  is ${pp(values)}`);

        db.run(sql, values, function(error) {
          if (error) {
            next(error);
          } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
              (error, timesheet) => {
                return res.status(201).send({timesheet: timesheet});
              });
          }
        }); //end db.run
    } //end if
  }); //end db.get
}); //end POST

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.employee.id;
  const tsheetsql = 'SELECT * FROM Employee WHERE Employee.id = $ID';
  const values = {$ID: employeeId};

  //console.log(`>>>>>> req.employee.id  is ${pp(values)}`);

  db.get(tsheetsql, values, (error, emp) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date || !employeeId) {
        return res.sendStatus(400);
      }

      const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, ' +
          'date = $date, employee_id = $employeeId ' +
          'WHERE Timesheet.id = $ID';
        const values = {
            $hours: hours,
            $rate: rate,
            $date: date,
            $employeeId: employeeId,
            $ID: req.params.timesheetId,
          };
      //console.log(sql); // debug

      db.run(sql, values, (error) => {
        if (error) {
          return res.sendStatus(404);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
            (error, timesheet) => {
              if(error){
                return res.sendStatus(404);
              }
              res.status(200).json({timesheet: timesheet});
            });
        }
      });
    } //end if
  }); //end db.get
});


timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $ID';
  const values = {$ID: req.params.timesheetId};

  db.run(sql, values, (error) => {
    if (error) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  });
});


module.exports = timesheetsRouter;
