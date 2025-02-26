import { Schema, model } from "mongoose";

const InvoiceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es requerido"],
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "El producto es requerido"],
        },
        quantity: {
          type: Number,
          required: [true, "La cantidad es requerida"],
          min: [1, "Debe haber al menos 1 producto"],
        },
      },
    ],
    total: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now, 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Invoice", InvoiceSchema);
