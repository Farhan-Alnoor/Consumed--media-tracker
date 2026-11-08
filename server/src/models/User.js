import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';



const userSchema = new mongoose.Schema(
    {
        username : {type : String, required : true, unique : true,trim :true , minlength : 3},
        email : {type : String, required : true, unique : true,trim :true },
        password : {type : String, required : true, minlength : 8, select : false}

    },
    {timestamps: true}
);



userSchema.pre('save', async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,12);
    next;
});


userSchema.methods.comparePassword = function (candidate){
    return bcrypt.compare(candidate,this.password)
}



export default mongoose.model("User", userSchema);