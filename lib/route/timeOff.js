'use strict';

var express   = require('express'),
    router    = express.Router(),
    Promise   = require('bluebird');
const {sequelize} = require('../model/db/index');
const moment = require("moment");

router.all(/.*/, require('../middleware/check_api_key'));

router.post('/time-off/', async (req, res) => {
    let month;
    if(+req.body.month < 10){
        month = `0${+req.body.month}`
    }
    Promise
        .try(() => sequelize.query(`select * from 'Leaves'  left join 'Users' ON 'Leaves'.'userId' = 'Users'.'id' Where 'Users'.'email' IN (?) AND 
      status = 2 AND (strftime('%m', 'leaves'.'date_start') = ? OR strftime('%m', 'leaves'.'date_end') =  ?)
                AND (strftime('%Y', 'leaves'.'date_start') = ? OR strftime('%Y', 'leaves'.'date_end') =  ?)`, {
            replacements: [req.body.email, month, month,req.body.year, req.body.year], type: sequelize.QueryTypes.SELECT
        }).then(results => {
            const listTimeOff = [];
            for(let email of req.body.email){
                listTimeOff.push({email, dateOff: [] });
            }

            //count time off
            for (const item of results){
                for(const timeOff of listTimeOff){
                    if (item.email === timeOff.email){
                        let startDate = new Date(item.date_start)
                        let endDate = new Date(item.date_end)
                        const date = new Date(req.body.year,req.body.month-1,15 )
                        const totalDayInMonth = moment(date).daysInMonth();
                        const firstDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
                        const lastDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), totalDayInMonth));
                        if(startDate.getMonth()+1 !==  +month){
                            startDate = firstDate
                        }
                        if(endDate.getMonth()+1 !==  +month){
                            endDate = lastDate
                        }
                        timeOff.dateOff.push({beginDate: startDate, endDate })                  }
                }
            }
            res.json(listTimeOff);
        }))
        .catch(error => {
            res.status(500).send(error);
        });
});

module.exports = router;