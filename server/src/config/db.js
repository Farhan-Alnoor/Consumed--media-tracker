import mongoose from "mongoose"

 

 async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log ("MONGO DONGO");
    }
    catch(err){
        console.error("MONGO NONGO:", err.message);
        process.exit(1)
    }

}

export { connectDB }