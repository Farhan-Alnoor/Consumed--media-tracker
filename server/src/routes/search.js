import {Router} from "express";
import { searchMovies,searchTV } from "../services/tmdb.js";


const router = Router()


router.get("/",async (req,res)=>{

    const {q,type} = req.query;
    if (!q || !q.trim()){
        return res.status(400).json({message: "Query parameter 'q' is required"});

        
    }
    try{
            let results;
            if (type ==="movie"){
                results = await searchMovies(q);
        }else if (type === "tv"){
            results = await searchTV(q);
        }else{
            return res.status(400).json({message :"Unsupported type."});
          }
        res.json({results});
    }
    catch(err){
    console.error(err);
    res.status(502).json({message : "Failed to fetch from external provider"});
    }

})


export default router;