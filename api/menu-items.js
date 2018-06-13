const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const pp = x => JSON.stringify(x, null, 2);

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = {$menuItemId: menuItemId};

  db.get(sql, values, (error, item) => {
    if (error) {
      next(error);
    } else if (item) {
      req.menuItem = item;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {

  const sql = 'SELECT * FROM Menu WHERE Menu.id = $ID';
  const values = { $ID: req.params.menuId};

  db.get(sql, values, (error, results) => {
    if(error || !results){
      return res.sendStatus(404); //did not find the menu
    } else {
      const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $ID';

      db.all(sql, values, (err, menuItems) => {
          if (err) {
            return res.sendStatus(404);
          } else {
            return res.status(200).send({menuItems: menuItems});
          }
        });
    }; //end if
  });
});

menuItemsRouter.post('/', (req, res, next) => {

  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        mId = req.params.menuId;

  if (!name || !description || !inventory || !price || !mId) {
    return res.sendStatus(400);
  }

  //first check that the menu exists
  db.get(`SELECT * FROM Menu WHERE Menu.id = $ID`, {$ID: mId}, (error, exists) => {
    if (error){
      return res.sendStatus(404);
      next();
    } else {
      const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) ' +
          'VALUES ($name, $description, $inventory, $price, $menuId)';
      const values = {
          $name: name,
          $description: description,
          $inventory: inventory,
          $price: price,
          $menuId: mId
        };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
            (error, menuItem) => {
                return res.status(201).send({menuItem: menuItem});
                next();
          }); //end db.get
        }
      }); //end db.run
    } //end if
  }); //end db.get
}); //end post route

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  debugger;

    const name = req.body.menuItem.name,
          description = req.body.menuItem.description,
          inventory = req.body.menuItem.inventory,
          price = req.body.menuItem.price,
          menuId = req.params.menuId;
          menuItemId = req.menuItem.id;

          /* debug
    console.log(`>>>>>> name is ${pp(name)}`);
    console.log(`>>>>>> desc is ${pp(description)}`);
    console.log(`>>>>>> inventory is ${pp(inventory)}`);
    console.log(`>>>>>> price is ${pp(price)}`);
    console.log(`>>>>>> menuId is ${pp(menuId)}`);
    console.log(`>>>>>> menuItemId is ${pp(menuItemId)}`);
*/

    if (!name || !description || !inventory || !price || !menuId) {
      return res.sendStatus(400);
    }

    const sql = 'UPDATE MenuItem SET name = $name, description = $description, ' +
        'inventory = $inventory, price = $price, menu_id = $menuId ' +
        'WHERE MenuItem.id = $ID';
      const values = {
          $name: name,
          $description: description,
          $inventory: inventory,
          $price: price,
          $menuId: menuId,
          $ID: req.menuItem.id
        };

    debugger;

    db.run(sql, values, (error) => {
      debugger;
      if (error) {
        return res.sendStatus(404);
      } else {

        const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $ID';
        const values = {$ID: menuItemId};

        db.get(sql, values, (error, menuItem) => {
            debugger;
            res.status(200).json({menuItem: menuItem});
          });
      }; //end if
    }); //end db.run
}); //end function


menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $ID';
  const values = {$ID: req.params.menuItemId};
  debugger;
  db.run(sql, values, (error) => {
    debugger;
    if (error) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    };
  });
});


module.exports = menuItemsRouter;
