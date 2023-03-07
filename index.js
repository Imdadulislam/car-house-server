const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

// middlewaRE

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o8hue.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("carHouse");
        const CarCollection = database.collection("Cars");
        const perchaseCollection = database.collection("perchase");
        const reviewCollection = database.collection("review");
        const usersCollection = database.collection("userinfo");

        // Get Cars
        app.get('/cars', async (req, res) => {
            const cursor = CarCollection.find({});
            const Cars = await cursor.toArray();
            res.send(Cars);
        });
        // POst Car
        app.post('/cars', async (req, res) => {
            const cars = req.body;
            const result = await CarCollection.insertOne(cars);
            res.json(result);
        });


        // Get single product
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const car = await CarCollection.findOne(query);
            res.json(car);
        });

        // All Perchase
        app.get('/perchase', async (req, res) => {
            const cursor = perchaseCollection.find({});
            const perchase = await cursor.toArray();
            res.send(perchase);
        });

        // My perchase
        app.get('/perchase', async (req, res) => {
            const result = await perchaseCollection.find({ email: req.query.email }).toArray();
            res.send(result);
        });

        // Get info for Payment
        // app.get('/perchase/:id', async (req, res) => {
        //     const id = req.params.id;
        //     console.log(id);
        //     const query = { _id: ObjectId(id) };
        //     console.log(query);
        //     const result = await perchaseCollection.findOne(query);
        //     res.json(result);
        // });
        app.get('/perchase/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await perchaseCollection.findOne(query);
            res.json(result);
        })
        // post perchase
        app.post('/perchase', async (req, res) => {
            const perchase = req.body;
            const result = await perchaseCollection.insertOne(perchase);
            res.json(result);
        });
        // Update Status
        app.put('/updateStatus/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            const result = await perchaseCollection.updateOne(filter, { $set: { status: updateStatus }, });
            res.send(result);

        })

        // Cancel Booking
        app.delete('/cancelPurchase/:id', async (req, res) => {
            const result = await perchaseCollection.deleteOne({ _id: ObjectId(req.params.id), });
            res.send(result);
        })

        // Delete Service
        app.delete('/deleteCar/:id', async (req, res) => {
            const result = await CarCollection.deleteOne({ _id: ObjectId(req.params.id), });
            res.send(result);
        })

        // Get userInfo 
        app.get('/userinfo/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // Post Review
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });
        // Get Review
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });

        // Userinfo post to database
        app.post('/userinfo', async (req, res) => {
            const result = await usersCollection.insertOne(req.body);
            res.json(result);
        });
        // Google User info post to database
        app.put('/userinfo', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // 
        app.put('/userinfo/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Travel server is running');
});
app.listen(port, () => {
    console.log('Server Running at', port);
})