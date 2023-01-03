'use strict';

var express   = require('express'),
    router    = express.Router(),
    Promise   = require('bluebird');
const {sequelize} = require('../model/db/index');

router.all(/.*/, require('../middleware/check_api_key'));

router.post('/time-off/', async (req, res) => {
    Promise
      .try(() => sequelize.query(`select * from 'Leaves'  left join 'Users' ON 'Leaves'.'userId' = 'Users'.'id' Where 'Users'.'email' IN (?)`, {
          replacements: [req.body.email], type: sequelize.QueryTypes.SELECT
      }).then(results => {
        res.json(results);
    }))
      .catch(error => {
          res.status(500).send(error);
      });
});

module.exports = router;