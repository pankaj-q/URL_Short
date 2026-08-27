import mongoose from 'mongoose';
const urlSchema = new mongoose.Schema( {
  
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
       type: String,
       required: true,
       unique: true
    },
     
    clicks: {
        type: Number,
        default: 0
    },
    expiresAt : {
      type: Date,
      default: null
    }
},

  { timestamps: true },
);

const URL =  mongoose.model("URL", urlSchema)
export default URL;
