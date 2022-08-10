const express = require('express');
const route = express.Router();
const mysql = require('../mysql').connection;
const bcrypt = require('bcrypt'); // com isso nossas senhar de ususarios serao cripitografasdas
const jwt = require('jsonwebtoken');   // aqui vamos criar um token por quanto tempo os daods podem ficar salvo no cache
const axios = require('axios').default;
const username = "admin";
const password = " ";
const credentials = `${username}:${password}`;
const paginate = new Array();
const credentialsEncondent = Buffer.from(credentials).toString('base64');
const url = "http://comagranju.ddns.com.br:2458/rest/GET/PATH/CHAR/";
const herois = ["1009282","1014873","1009733"];

const sleep = (miliseconds) => { return new Promise(resolve => setTimeout(resolve, miliseconds)) }

route.get('/visualizacao', async (req, res, next) => {
    try {
        for (let index = 0; index < herois.length; index++) {
            let element = herois[index];
            let { data } = await axios.get(url + element,
                {
                    headers: {
                        'Authorization': `Basic ${credentialsEncondent}`
                    }
                }
            );

            // let objeto = JSON.parse(data)
            console.log(data);
            paginate.length;
            if (paginate.length === 0) {
                const paginate = new Array();
            }
            paginate.push(data);
            // await sleep(1000)
        }
        res.status(200).json({ response: paginate })
    } catch (error) {
        console.log(error);
    }
});

route.post('/cadastro', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [req.body.email],
            (error, results) => {
                if (error) { return res.status(500).send({ error: error }) };
                if (results.length > 0) {
                    res.status(409).send({ menssagem: 'Email já está cadastrado' })
                }
                else {
                    bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                        if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                        conn.query(
                            'INSERT INTO usuarios (email, senha) VALUES (?,?)',
                            [req.body.email, hash],
                            (error, result) => {
                                conn.release();
                                if (error) { return res.status(500).send({ error: error }) };
                                const response = {
                                    menssagem: 'Usuario criado com suecesso',
                                    usuarioCriado: {
                                        email: req.body.email
                                    }
                                }
                                return res.status(201).send({ response });
                            }
                        )
                    });
                }
            }
        );
    });
});
route.post('/login',async (req, res, next) => {
    try {
        if(paginate.length == 0 || paginate < 3){
            for (let index = 0; index < herois.length; index++) {
                let element = herois[index];
                let { data } = await axios.get(url + element,
                    {
                        headers: {
                            'Authorization': `Basic ${credentialsEncondent}`
                        }
                    }
                );
    
                // let objeto = JSON.parse(data)
                console.log(data);
                paginate.length;
                if (paginate.length === 0) {
                    const paginate = new Array();
                }
                paginate.push(data);  
        };
        }
        // res.status(200).json({ response: paginate })
    } catch (error) {
        console.log(error);
    }
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        conn.query(query, [req.body.email], (error, results, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }) };
            if (results.length < 1) {
                return res.status(401).send({ menssagem: 'Falha na altenticação' });
            };
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if (err) {
                    return res.status(401).send({ menssagem: 'Falha na altenticação' });
                };
                if(results[0].email == "felipefraga.assis@gmail.com"){
                    if (result) {
                        const token = jwt.sign({
                            id_usuario: results[0].id_usuario,
                            email: results[0].email
                        },
                            'segredo',
                            {
                                expiresIn: "1h"
                            }
                        );
                        return res.status(200).send({
                            menssagem: 'Authenticado com sucesso',
                            response: paginate[2],
                            token: token
                        });
                    }
                }
                if(results[0].email == "gabrijac58@gmail.com"){
                    if (result) {
                        const token = jwt.sign({
                            id_usuario: results[0].id_usuario,
                            email: results[0].email
                        },
                            'segredo',
                            {
                                expiresIn: "1h"
                            }
                        );
                        return res.status(200).send({
                            menssagem: 'Authenticado com sucesso',
                            response: paginate,
                            token: token
                        });
                    }
                }
                return res.status(401).send({ menssagem: 'Falha na altenticação' });
            });
        });
    })
})

module.exports = route;