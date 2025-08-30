import { Schema, model } from "mongoose";
import Product from "../products/product.model.js";

const InvoiceSchema = new Schema(
  {
    fechaCompra: {
      type: Date,
      required: [true, "La fecha de compra es requerida"],
    },
    noFactura: {
      type: String,
      required: [true, "El número de factura es requerido"],
      trim: true,
    },
    serieFactura: {
      type: String,
      required: [true, "La serie de factura es requerida"],
      trim: true,
    },
    proveedor: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: [true, "El proveedor es requerido"],
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
        costoUnitario: {
          type: Number,
          default: 0,
        },
        subtotal: {
          type: Number,
          default: 0,
        },
        // Para crear un producto nuevo directamente desde la factura
        nuevoProducto: {
          type: Object,
          default: null,
        },
      },
    ],
    total: {
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

InvoiceSchema.pre("save", async function (next) {
  let totalFactura = 0;

  for (let item of this.productos) {
    let productoDB;

    // Si viene nuevoProducto, lo creamos
    if (item.nuevoProducto) {
      productoDB = new Product({
        ...item.nuevoProducto,
        proveedor: this.proveedor,
      });
      await productoDB.save();
    } else {
      productoDB = await Product.findById(item.producto);
      if (!productoDB) {
        throw new Error(`Producto con ID ${item.producto} no encontrado`);
      }
    }

    // asignar id del producto (nuevo o existente)
    item.producto = productoDB._id;

    // tomar costo unitario desde Product si no se envió
    if (!item.costoUnitario || item.costoUnitario === 0) {
      item.costoUnitario = productoDB.costoUnitario;
    }

    // calcular subtotal
    item.subtotal = item.cantidad * item.costoUnitario;

    // acumular total de la factura
    totalFactura += item.subtotal;

    // actualizar stock del producto
    productoDB.stock += item.cantidad;
    await productoDB.save();

    // eliminar la propiedad auxiliar para no guardarla en DB
    delete item.nuevoProducto;
  }

  this.total = totalFactura;
  next();
});

export default model("Invoice", InvoiceSchema);
