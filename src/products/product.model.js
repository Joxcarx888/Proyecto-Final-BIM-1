import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    sku: {
      type: String,
      required: [true, "El SKU es requerido"],
      unique: true,
      trim: true,
    },
    nombreArticulo: {
      type: String,
      required: [true, "El nombre del artículo es requerido"],
      maxLength: [100, "No más de 100 caracteres"],
      minLength: [2, "Mínimo 2 caracteres"],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es requerida"],
      maxLength: [1000, "No más de 1000 caracteres"],
      minLength: [10, "Mínimo 10 caracteres"],
      trim: true,
    },
    proveedor: {
      type: Schema.Types.ObjectId,
      ref: "Provider", // ID de Mongo
      required: [true, "El proveedor es requerido"],
    },
    factura: {
      type: Schema.Types.ObjectId,
      ref: "Invoice", // ID de Mongo del modelo Invoice
      required: [true, "La factura es requerida"],
    },
    unidad: {
      type: String,
      required: [true, "La unidad es requerida"], 
      trim: true,
    },
    cantidad: {
      type: Number,
      required: [true, "La cantidad es requerida"],
      min: [0, "La cantidad no puede ser negativa"],
    },
    costoUnitario: {
      type: Number,
      required: [true, "El costo unitario es requerido"],
      min: [0, "El costo unitario no puede ser negativo"],
    },
    valorInventario: {
      type: Number,
      required: [true, "El valor de inventario es requerido"],
      min: [0, "El valor de inventario no puede ser negativo"],
    },
    valorConIvaSugerido: {
      type: Number,
      required: [true, "El valor con IVA y % sugerido es requerido"],
      min: [0, "El valor no puede ser negativo"],
    },
    valorReal: {
      type: Number,
      required: [true, "El valor real es requerido"],
      min: [0, "El valor real no puede ser negativo"],
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Product", ProductSchema);
