const express=require("express");
const mongoose=require("mongoose");
const routes=require("./routes/index");
const cors=require("cors");

const app=express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


mongoose
.connect("mongodb+srv://saileshkv29:2906@cluster0.iquvx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{
    console.log("Connected");
})
.catch((err)=>{
    console.log("Error Connecting to DB",err)
});

app.use("/",routes);

const port=3000;

app.listen(port,()=>{
    console.log(`Server running @ ${port}`);
});