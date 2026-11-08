import mongoose, { mongo }  from "mongoose";

const mediaItemSchema = new mongoose.Schema(
    {

        type: {type : String,enum : ["movie","tv","game","anime"],required : true},
        source : {type : String,enum : ["tmdb,igdb,anilist"],required : true},
        externalId: {type : String, required : true},
        title: {type: String,required :true},
        posterUrl : String,
        overview : String,
        releaseDate : Date,
        genres : [String],
        totalUnits : Number,

    },
    {timestamps: true}

);



mediaItemSchema.index({source: 1, externalId: 1}, {unique: true});



export default mongoose.model("MediaItem", mediaItemSchema);


