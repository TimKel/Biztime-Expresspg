const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

const router = new express.Router();

router.get('/', async function(req, res,next){
    try{
        const results = await db.query(`SELECT * FROM invoices`);
        return res.send({ invoices: results.rows })
    }catch(err){
        next(err)
    }
})

router.get('/:id', async function(req, res, next){
    try{
        const { id } = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id])
        if(results.rows.length === 0){
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        return res.send({ company: results.rows[0]})
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

router.put('/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const amt = req.body.amt;
        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`, [amt, id])
        if (results.rows.length === 0){
            throw new ExpressError(`Invoice with id of ${id} could not be found`, 404)
        }
        return res.send({ invoice: results.rows[0]})
    }catch(err){
        next(err)
    }
})

router.delete('/:id', async (req, res, next) => {
    try{
        const id = req.params.id;
        const comp_code = req.body.comp_code;
        const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [id])
        if(results.rows.length === 0){
            throw new ExpressError(`Invoice with id of ${id} not found`, 404)
        }
        return res.send(`{ msg: Deleted ${id} from ${comp_code}}`)
    }catch(err){
        next(err)
    }
})

module.exports = router;