import { Schema, model } from "mongoose";
import Product from "../products/product.model.js";

const SaleSchema = new Schema(
  {
    fechaVenta: {
      type: Date,
      required: [true, "La fecha de venta es requerida"],
      default: Date.now,
    },
    cliente: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "El cliente es requerido"],
    },
    productos: [
      {
        producto: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        cantidad: {
          type: Number,
          required: [true, "La cantidad es requerida"],
          min: [1, "Debe haber al menos 1 producto"],
        },
        precioVenta: {
          type: Number,
          default: 0, // se llenará con el valorReal del producto
        },
        descuento: {
          type: Number,
          default: 0, // descuento en porcentaje (ej. 10 = 10%)
          min: [0, "El descuento no puede ser negativo"],
          max: [100, "El descuento no puede superar 100%"],
        },
        subtotal: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalVenta: {
      type: Number,
      default: 0,
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

// Pre-save para calcular subtotales y total
SaleSchema.pre("save", async function (next) {
  let total = 0;
  for (let item of this.productos) {
    const productoDB = await Product.findById(item.producto);
    if (!productoDB) {
      throw new Error(`Producto con ID ${item.producto} no encontrado`);
    }
    item.precioVenta = productoDB.valorReal;
    const subtotalSinDesc = item.precioVenta * item.cantidad;
    const montoDescuento = subtotalSinDesc * (item.descuento || 0) / 100;
    item.subtotal = subtotalSinDesc - montoDescuento;
    total += item.subtotal;
  }
  this.totalVenta = total;
  next();
});

export default model("Sale", SaleSchema);
