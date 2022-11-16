const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;


//middleware

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfahrph.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('carServices').collection('service')

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