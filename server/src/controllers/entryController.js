import MediaItem from "../models/MediaItem.js"
import Entry from "../models/Entry.js"

const ITEM_FIELDS = ["type", "source", "externalId", "title", "posterUrl", "overview", "releaseDate", "genres", "totalUnits"];
const ENTRY_FIELDS = ["status", "rating", "progress", "notes", "startedAt", "finishedAt"];


function pick(obj, fields){
    const out = {};
    for (const f of fields){
        if (obj[f] !== undefined) out[f] = obj[f];
    }
    return out;
}


export async function addEntry(req,res){

    try{
        const {item,...entrydata} = req.body;
        if (!item || !item.source || !item.externalId){
            return res.status(400).json({message: "Item with source and external id is required"});
        }
        const itemData = pick(item,ITEM_FIELDS)

        itemData.externalId = String(itemData.externalId);
        const mediaItem = await MediaItem.findOneAndUpdate(
            {source : itemData.source, externalId: itemData.externalId},
            {$setOnInsert: itemData},
            {upsert: true,  returnDocument: 'after', runValidators : true}

            
        );

        const entry  = await Entry.create({
            ...pick(entrydata,ENTRY_FIELDS),
            user: req.user._id,
            item: mediaItem._id
        });
        
        await entry.populate("item");
       
        res.status(201).json({entry});
        
    }catch(err){
        console.error(err);
        if (err.code === 11000){
            return res.status(409).json({message: "This title is already in your list"});

        }
        if (err.name === "ValidationError"){
            return res.status(400).json({message: err.message});
        }
        console.error(err);
        res.status(500).json({message : "Server error"})
    }

}


export async function listEntries(req,res) {
    try{
        const {status,type}= req.query;
        const filter = {user: req.user._id};
        if (status) filter.status = status;
        
        const entries = await Entry.find(filter)
        .populate({path: "item",match:type? {type}: {}})
        .sort({updatedAt: -1})
        res.json({entries : entries.filter((e)=>e.item)});

    
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Server error"});
    }
}


export async function updateEntry(req,res){
    try{
        const entry = await Entry.findOneAndUpdate(
            {_id:req.params.id, user: req.user._id},
            pick(req.body, ENTRY_FIELDS),
            {new:true, runValidators : true}
        ).populate("item");
        
        if (!entry) return res.status(404).json({message: "Entry not found"});
        res.json({entry});
    }catch (err){
        if (err.name === "ValidationError" || err.name === "CastError"){
            return res.status(400).json({message : err.message});
        }
        console.error(err);
        res.status(500).json({message : "Server Error"})
    }
}



export async function deleteEntry(req,res){

    try{
        const entry = await Entry.findOneAndDelete({_id : req.params.id,user: req.user._id});
     
        if (!entry) return res.status(404).json({message : "Entry not found"});
        res.status(204).end();


    }catch(err){
        if (err.name == "CastError"){
            return res.status(400).json({message : "Invalid entry id"});
        }
    

    console.error(err);
    res.status(500).json({ message: "Server error" });
    }
}