import { Schema, model } from "mongoose";

const HistorySchema = new Schema(
  {
    date: {
      type: String,
      required: [true, "Date is required"]
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"]
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    employeeName: {
      type: String
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"]
    },
    productName: {
      type: String
    },
    motive: {
      type: String,
      maxLength : [200, "Cant be overcome 200 characters"]
    },
    destiny: {
      type: String,
      maxLength : [75, "Cant be overcome 75 characters"]
    },
    status:{
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("History", HistorySchema);
