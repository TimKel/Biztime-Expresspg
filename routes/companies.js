const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

const router = new express.Router();

router.get('/', async function(req, res,next){
    try{
        const results = await db.query(`SELECT * FROM companies`);
        return res.send({ companies: results.rows })
    }catch(err){
        next(err)
    }
})

// router.get('/:code', async function(req, res, next){
//     try{
//         const { code } = req.params;
//         const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
//         if(results.rows.length === 0){
//             throw new ExpressError(`Can't find company with id code of ${code}`, 404);
//         }
//         return res.send({ company: results.rows[0]})
//     }catch(err){
//         next(err)
//     }
// })

router.get("/:code", async function (req, res, next) {
    try {
      let code = req.params.code;
  
      const compResult = await db.query(
            `SELECT code, name, description
             FROM companies
             WHERE code = $1`,
          [code]
      );
  
      const invResult = await db.query(
            `SELECT id
             FROM invoices
             WHERE comp_code = $1`,
          [code]
      );
  
      if (compResult.rows.length === 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      }
  
      const company = compResult.rows[0];
      const invoices = invResult.rows;
  
      company.invoices = invoices.map(inv => inv.id);
  
      return res.json({"company": company});
    }
  
    catch (err) {
      return next(err);
    }
  });
  

router.post('/', async (req, res, next) => {
    try{
        const { code, name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description])
        return res.status(201).json({ company: results.rows[0]})
    }catch(err){
        next(err)
    }
})

router.patch('/:code', async (req, res, next) =>{
    try{
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2
        WHERE code=$3 RETURNING code, name, description`, [name, description, code])
        if(results.rows.length === 0){
            throw new ExpressError(`Can't update company with code ${code}`, 404)
        }
        return res.send({ company: results.rows[0]})     
    }catch(err){
        next(err)
    }
})

router.delete('/:code', async (req, res, next) => {
    try{
        const code = req.params.code;
        const results = await db.query(`DELETE FROM companies WHERE code=$1`, [code])
        return res.send(`{ msg: Deleted ${code}}`)
    }catch(err){
        next(err)
    }
})

module.exports = router;