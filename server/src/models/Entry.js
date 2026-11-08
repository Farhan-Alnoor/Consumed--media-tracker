import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
 {
    user: {type : mongoose.Schema.Types.ObjectId,ref: "User",required :true},
    item: { type: mongoose.Schema.Types.ObjectId, ref: "MediaItem", required: true },
    status: {
        type: String,
        enum: ["planned","in_progress","comleted,","dropped"],
        default : "planned"
    },
    rating: {type : Number ,min:0,max :10},
    progress : {type : Number, default:0, min: 0},
    notes : String,
    startedAt: Date,
    finishedAt: Date
 },

 {timestamps : true}


);



entrySchema.index({user: 1, item: 1}, {unique: true});

export default mongoose.model("Entry",entrySchema);