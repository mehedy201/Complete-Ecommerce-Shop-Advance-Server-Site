const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const app = express();
const port = process.env.PORT || 5000;


// Use Middleware ----------------------------
app.use(cors());
app.use(express.json());

// MongoDB ________________________________________________________________________
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@completeecommerceshopap.gufeu5b.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const laptopCategoryData = 'Laptop'
async function run() {
    try{
        await client.connect();
        const productsCollection = client.db("Complete_Ecommerce_Shop_Database").collection("Products");
        const subscriberCollection = client.db("Complete_Ecommerce_Shop_Database").collection("Subscriber");
        const userOrderdData = client.db("Complete_Ecommerce_Shop_Database").collection("userOrderdData");



        // Post Product from client site________________________________________________
        app.post('/products', async(req, res) => {
          const product = req.body;
          const result = await productsCollection.insertOne(product);
          res.send({success: true, result});
        })
        //Get single Product  Data from server____________________________________________
        app.get('/products/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id) };
            const singleData = await productsCollection.findOne(query);
            res.send(singleData);
        })

        // Update Product _______________________________________________________________
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id)};
            const option = {upsert: true};
            const updateDocument = {
               $set: {
                title: req.body.title,
                description: req.body.description,
                featuredImage: req.body.featuredImage,
                inputCategoryData: req.body.inputCategoryData,
                inputBrandData: req.body.inputBrandData,
                inputCriteriaData: req.body.inputCriteriaData,
                inputRating: req.body.inputRating,
                price: req.body.price,
               },
            };
            const result = await productsCollection.updateOne(filter, updateDocument, option);
            res.send(result)
          })

        // Products Person Data from Server ______________________________________________
        app.get('/products', async(req, res) => {
            const query ={};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
        // Products Person Data from Server ______________________________________________
        app.get('/products/category/:name', async(req, res) => {
            const name = req.params.name
            const query ={inputCategoryData: name};
            const cursor = await productsCollection.find(query).toArray();
            res.send(cursor);
        });


        // Delete Product  _______________________________________________________________
        app.delete('/products/:id',  async(req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = {_id: new ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            res.send(result);
          })


        // Post Subscriber Email ________________________________________________________________________________________==
        app.post('/subscriber', async(req, res) => {
            const subscriber = req.body;
            const result = await subscriberCollection.insertOne(subscriber);
            res.send({success: true, result});
        })

        // User Ordered Data Post ________________________________________________________________________________________==
        app.post('/userOrderdData', async(req, res) => {
            const userData = req.body;
            const result = await userOrderdData.insertOne(userData);
            res.send({success: true, result});
        })




        // Stripe Intregation_________________________________________________
    
        app.post("/create-payment-intent", async (req, res) => {
            const {newPrice} = req.body;
            const amount = newPrice * 100;
          
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
              currency: "usd",
              amount: amount,
              "payment_method_types": [
                  "card"
              ]
            });
          
            res.send({
              clientSecret: paymentIntent.client_secret,
            });
          });
          


        

    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Running Complete Ecommerce Shop Server');
});

app.listen(port, () => {
    console.log('Running Complete Ecommerce Shop Server')
})