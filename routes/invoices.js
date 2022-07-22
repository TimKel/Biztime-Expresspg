const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

const router = new express.Router();

router.get('/', async function(req, res,next){
    try{
        const results = await db.query(`SELECT id, comp_code
        FROM invoices 
        ORDER BY id`);
        return res.json({ "invoices": results.rows })
    }catch(err){
        next(err)
    }
})

router.get('/:id', async function(req, res, next){
    try{
        const { id } = req.params;
        const results = await db.query(`SELECT i.id, 
        i.comp_code, 
        i.amt, 
        i.paid, 
        i.add_date, 
        i.paid_date, 
        c.name, 
        c.description 
        FROM invoices AS i
        INNER JOIN companies AS c ON (i.comp_code = c.code)  
        WHERE id = $1`, [id]);
        if(results.rows.length === 0){
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        const data = result.rows[0];
        const invoice = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
        };

        return res.json({"invoice": invoice});
    }catch(err){
        next(err)
    }
})

router.post('/', async (req, res, next) => {
    try{
        const { comp_code, amt } = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
        return res.status(201).json({ invoice: results.rows[0]})
    }catch(err){
        next(err)
    }
})

// router.put('/:id', async (req, res, next) => {
//     try{
//         const { id } = req.params;
//         const amt = req.body.amt;
//         const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`, [amt, id])
//         if (results.rows.length === 0){
//             throw new ExpressError(`Invoice with id of ${id} could not be found`, 404)
//         }
//         return res.send({ invoice: results.rows[0]})
//     }catch(err){
//         next(err)
//     }
// })

router.put("/:id", async function (req, res, next) {
    try {
      let {amt, paid} = req.body;
      let id = req.params.id;
      let paidDate = null;
  
      const currResult = await db.query(
            `SELECT paid
             FROM invoices
             WHERE id = $1`,
          [id]);
  
      if (currResult.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${id}`, 404);
      }
  
      const currPaidDate = currResult.rows[0].paid_date;
  
      if (!currPaidDate && paid) {
        paidDate = new Date();
      } else if (!paid) {
        paidDate = null
      } else {
        paidDate = currPaidDate;
      }
  
      const result = await db.query(
            `UPDATE invoices
             SET amt=$1, paid=$2, paid_date=$3
             WHERE id=$4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
          [amt, paid, paidDate, id]);
  
      return res.json({"invoice": result.rows[0]});
    }
  
    catch (err) {
      return next(err);
    }
  
  });

router.delete('/:id', async (req, res, next) => {
    try{
        const id = req.params.id;
        const comp_code = req.body.comp_code;
        const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [id])
        if(results.rows.length === 0){
            throw new ExpressError(`Invoice with id of ${id} not found`, 404)
        }
        return res.json({ status: "Deleted"})
    }catch(err){
        next(err)
    }
})

module.exports = router;