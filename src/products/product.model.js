import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    nombreArticulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    proveedor: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    factura: { type: Schema.Types.ObjectId, ref: "Invoice"},
    unidad: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true, min: 0 },
    costoUnitario: { type: Number, required: true, min: 0 },
    valorInventario: { type: Number, required: true, min: 0 },
    valorConIvaSugerido: { type: Number, required: true, min: 0 },
    valorReal: { type: Number, required: true, min: 0 },
    imagenes: [
      {
        type: String, // Guardamos la ruta del archivo en el servidor
      },
    ],
    status: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export default model("Product", ProductSchema);
