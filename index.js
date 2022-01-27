const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;



//midle
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mieka.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
       await client.connect();
       console.log("connected successfully")
       const database = client.db('Al-asrDB')
       const userCollection = database.collection('users')
       const blogCollection = database.collection('blogs')


       // user post
   app.post('/users', async (req, res) =>{
    const user = req.body;
    console.log(user)
    const result = await userCollection.insertOne(user);
    res.json(result);

})

app.put('/users', async (req, res) =>{
    const user = req.body;
    
    const filter = {email: user.email};;
    const options = {upsert: true};
    const updateDoc = {$set: user};
    const result = await userCollection.updateOne(filter, updateDoc, options);
    
    res.json(result);
})
app.get('/users/:email', async (req, res) =>{
    const email = req.params.email;
    const query = {email: email};
    const user = await userCollection.findOne(query)
    let isAdmin = false;
    if(user?.role === 'admin'){
        isAdmin = true;
    }
    res.json({admin: isAdmin});
})


  // only admin will make admin 
  app.put('/users/admin', async (req, res) =>{
    const user = req.body;
    console.log(user)
    const filter = {email: user.email}
    const updateDoc = {$set:{role: 'admin'}};
    const result = await userCollection.updateOne(filter,updateDoc)
    res.json(result)
})

//post blog
  
app.post('/blogs', async (req, res) =>{
    const blog = req.body;
    console.log(blog)
    const result = await blogCollection.insertOne(blog);
    res.json(result);

})
app.get('/blog', async (req, res) =>{
    const cursor = blogCollection.find({});
    const blog = await cursor.toArray()
     res.send(blog)
 })
   //update the status
   app.put('/statusUpdate/:id', async (req, res) =>{
    const filter = {_id: ObjectId(req.params.id)};
    const result = await blogCollection.updateOne(filter, {
        $set: {
            status: req.body.status,
        },
    })
    res.send(result)
})
         //delete car from manage services page
            app.delete('/blogs/:id', async (req, res) =>{
                const id = req.params.id;
                const query = {_id: ObjectId(id)};
                const result = await blogCollection.deleteOne(query);
                console.log('deleting user with id', result);
                
                res.json(result);
               })

               app.get('/allBlog', async (req, res) =>{
                const cursor = blogCollection.find({});
                const page = req.query.page;
                const size = parseInt(req.query.size);
                let blogs;
                const count = await cursor.count()
                if(page){
                  blogs = await cursor.skip(page*size).limit(size).toArray()
                }
                else{
                    blogs = await cursor.toArray()
                }
                
                
                 res.send({
                     count,
                     blogs
                 })
             })



            //  app.put('/updateBlog/:id', async (req, res) => {
            //     const id = req.params.id;
            //     const updatedNews = req.body;
            //     const filter = { _id: ObjectId(id) };
            //     const options = { upsert: true };
            //     const updateDoc = {
            //         $set: {
            //             title: updatedNews.title,
            //             image: updatedNews.image,
            //             description: updatedNews.description
            //         },
            //     };
            //     const result = await blogCollection.updateOne(filter, updateDoc, options);
            //     // console.log('updating', id)
            //     res.json(result)
            // })
            app.get('/UpdateBlogs/:id', async (req, res) => {
                const Id = (req.params.id);
                const query = {_id: ObjectId(Id)};
                const blog = await blogCollection.findOne(query);
                res.send(blog)

            });
            
               


    }
    finally{
      //await client.close();
    }

}
run().catch(console.dir);












app.get('/', function (req, res) {
    res.send('hello al asr')
})

app.listen(port, () =>{
    console.log('listening')
})