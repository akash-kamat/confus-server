const express = require("express")
const cors = require("cors")
const {MongoClient} = require("mongodb")

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 3001;

const connectionString = "";
const client = new MongoClient(connectionString);

client.connect();

const db = client.db("confus");
const collection = db.collection("confessions");
const mods = db.collection("moderators");



app.get("/",(req,res)=>{
    res.json("working")
})

app.post("/confess", async(req,res)=>{
    try {
        const {title,confession}=req.body;
        const toInsert ={
            "id":await collection.countDocuments({}) + 1,
            "title":title,
            "confession":confession,
            "time": new Date(),
            "ip":req.ip
        }
        await collection.insertOne(toInsert);
        res.json("added confession");
        console.log(req.ip)
    }catch(error){
        console.log(error)
    }
});

app.get("/getConfessions",async(req,res)=>{
    try{
        const data = collection.find({}).sort({"id":-1});
        list = []
        await data.forEach(doc=>{
            list.push({
            "id":doc.id,
            "title":doc.title,
            "confession":doc.confession,
            "time": doc.time,
            "ip":doc.ip
            })
        })
        res.json(list)
    }
    catch(error){
        console.log(error)
    }
})

app.post("/login",async(req,res)=>{
    try{
        const data = await mods.findOne(req.body)
        console.log(req.body)
        if (data == null) {
            res.json(false)
            console.log("wrong creds")
        } else {
            res.json(data)
            console.log("loggedin")
        }
    }
    catch(error){
        console.log(error)
    }
})

app.post("/delete",async(req,res)=>{
    try{
       const {username,password,postId} = req.body;
       const data = await mods.findOne({
           "username":username,
           "password":password
       })
       if (data == null) {
        res.json(false)
        console.log("wrong creds")
    } else {
        await collection.deleteOne({"id":postId})
        res.json(`Delete confession with if${postId}`)
    }
    }
    catch(error){
        console.log(error)
    }
})


app.post("/edit",async(req,res)=>{
    try {
        const result = await mods.findOne({
            "username": req.body.username,
            "password": req.body.password
        })
        if (result == null) {
            res.json("invalid credentials")
        } else {
            const query = {
                "id": req.body.id
            }
            const update = await collection.updateOne(query, {
                $set: {
                    confession: req.body.newConfession
                }
            })
            res.json(`Confession Updated`)
        }
    } catch (error) {
        console.log(error)
    }
})

app.listen(port,()=>{
    console.log("server is up on port:",port)
})


