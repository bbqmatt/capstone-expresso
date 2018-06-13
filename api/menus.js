const express = require('express');
const menusRouter = express.Router();
const menuItemsRouter = require('./menu-items.js');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const pp = x => JSON.stringify(x, null, 2);

menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      //console.log(`>>>>>> req.menu is ${pp(req.menu)}`);
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu',
    (err, menus) => {
      if (err) {
        next(err);
      } else {
        return res.status(200).send({menus: menus});
      }
    });
});

menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  };

  const sql = 'INSERT INTO Menu (title)' +
      'VALUES ($title)';
  const values = {
    $title: req.body.menu.title
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          if(error){
            return res.status(404);
          }
          res.status(201).json({menu: menu});
        });
    }
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
    if (req.menu){
      return res.status(200).json({menu: req.menu});
    } else {
      return res.status(404);
    }
});

menusRouter.put('/:menuId', (req, res, next) => {

  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $ID';
  const values = {
    $title: title,
    $ID: req.params.menuId
  };

  //console.log(sql); // debug

  db.run(sql, values, (error) => {
    if (error) {
      return res.sendStatus(404);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (error, menu) => {
          res.status(200).json({menu: menu});
        });
    }
  });

});


menusRouter.delete('/:menuId', (req, res, next) => {
  //first check that the menu has no menu-menuItems
  db.get(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`, (error, item) => {
    if (!item){
      const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
      const values = {$menuId: req.params.menuId};

      db.run(sql, values, (error) => {
        if (error) {
          res.sendStatus(404);
        } else {
          res.sendStatus(204);
        }
      });
    } else {
      return res.sendStatus(400); //cannot delete as a related mentItem exists
    }
  })
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

module.exports = menusRouter;
