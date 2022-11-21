const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;


//middleware

app.use(cors())
app.use(express.json())

//verified json Token

function verifyjwt(req, res, next) {
    const authHeader = req?.headers?.authorization;

    //condition for they have a token or not 
    if (!authHeader) {
        return res.status(401).send({ message: 'unathorized access' })
    }

    // Now I think they have the token, so this is the token validation condition

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    })
    

}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfahrph.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('carServices').collection('service')
        const orderCollection = client.db('carServices').collection('order')

        //auth

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })

            res.send(accessToken)
        })


        //service api

        //get
        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        //get one

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })

        //post 

        app.post('/service', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result)
        })

        // order post 

        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })

        //get order 

        app.get('/order', verifyjwt, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email
            if (email === decodedEmail) {
                const query = { email: email };
                const orders = orderCollection.find(query);
                const result = await orders.toArray();
                res.send(result)
            } else {
                res.send(403).send({ message: 'forbidden access' })
            }
        })


        //update

        app.put('/service/:id', async (req, res) => {
            const id = req.params.id;
            const editService = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: editService.name,
                    price: editService.price,
                    description: editService.description,
                    img: editService.img
                }

            }

            const result = await serviceCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })


        //delete

        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.deleteOne(query)
            res.send(result)
        })
    }

    finally {
        //await client.close()
    }
}

run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('hey mama my node code is working ')
})

app.listen(port, () => {
    console.log('post listen to', port)
})