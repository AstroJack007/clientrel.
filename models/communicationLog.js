import mongoose from "mongoose";

const communicationLogSchema= new mongoose.Schema({
  
  audienceQuery: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  audienceSize: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED'],
    default: 'PENDING',
  },
 
  deliveryDetails: [{
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    status: { type: String, enum: ['SENT', 'FAILED', 'PENDING'], default: 'PENDING' }
  }],
 
  createdBy: {
    type: String,
    required: true,
  }
}, { timestamps: true });

export default mongoose.models.Campaign || mongoose.model('Campaign', communicationLogSchema);
