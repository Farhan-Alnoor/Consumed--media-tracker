import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import "./models/User.js";
import "./models/MediaItem.js";
import "./models/Entry.js";
import authRoutes from "./routes/auth.js";
import searchRoutes from "./routes/search.js";
import entryRoutes from "./routes/entries.js"
import mediaRoutes from "./routes/media.js";
import browseRoutes from "./routes/browse.js";

dotenv.config();

const app = express();


const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/search",searchRoutes);
app.use("/api/entries",entryRoutes);
app.use("/api/media", mediaRoutes);
app.get("/api/health",(req,res)=>{
    res.json ({status :"Ok"});


});
app.use("/api/browse", browseRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() =>{
    app.listen (PORT,() => console.log('Server running on '+ PORT));
})


