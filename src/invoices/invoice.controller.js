import Invoice from "./invoice.model.js";
import Product from "../products/product.model.js";

// Crear factura (productos existentes o nuevos)
export const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;

    // Guardamos la factura
    const invoice = new Invoice(invoiceData);
    await invoice.save();

    if (invoiceData.productos && invoiceData.productos.length > 0) {
      let totalFactura = 0;

      await Promise.all(
        invoiceData.productos.map(async (p) => {
          const product = await Product.findById(p.producto);
          if (product) {
            const cantidad = Number(p.cantidad);
            const costoUnitario = Number(p.costoUnitario);

            // ✅ Actualizar stock
            product.cantidad += cantidad;

            // ✅ Actualizar valorInventario
            product.valorInventario = product.cantidad * product.costoUnitario;

            // Relacionar con la factura
            product.factura = invoice._id;

            // Subtotal en la factura
            p.subtotal = cantidad * costoUnitario;
            totalFactura += p.subtotal;

            await product.save();
          }
        })
      );

      invoice.total = totalFactura;
      await invoice.save();
    }

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("proveedor", "name email number")
      .populate("productos.producto", "nombreArticulo sku costoUnitario cantidad valorInventario imagenes");

    res.status(201).json({
      success: true,
      message: "Factura creada exitosamente y productos actualizados",
      invoice: populatedInvoice,
    });
  } catch (error) {
    console.error("Error al crear factura:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la factura",
      error: error.message || error,
    });
  }
};

// Listar facturas
export const listInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ status: true })
      .populate("proveedor", "name email number")
      .populate("productos.producto", "nombreArticulo sku costoUnitario imagenes");

    res.json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error("Error al listar facturas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener facturas",
      error,
    });
  }
};

// Editar factura
// Editar factura (REEMPLAZA cantidades en el inventario)
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCompra, noFactura, serieFactura, proveedor, productos } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Factura no encontrada" });
    }

    // ✅ Revertir el stock de la factura anterior
    if (invoice.productos && invoice.productos.length > 0) {
      await Promise.all(
        invoice.productos.map(async (oldItem) => {
          const oldProduct = await Product.findById(oldItem.producto);
          if (oldProduct) {
            // Restar lo que había aportado esta factura antes
            oldProduct.cantidad -= Number(oldItem.cantidad);
            if (oldProduct.cantidad < 0) oldProduct.cantidad = 0; // evitar negativos
            oldProduct.valorInventario = oldProduct.cantidad * oldProduct.costoUnitario;
            await oldProduct.save();
          }
        })
      );
    }

    // Actualizar datos básicos de la factura
    if (fechaCompra) invoice.fechaCompra = fechaCompra;
    if (noFactura) invoice.noFactura = noFactura;
    if (serieFactura) invoice.serieFactura = serieFactura;
    if (proveedor) invoice.proveedor = proveedor;

    let totalFactura = 0;

    // ✅ Aplicar las nuevas cantidades de la factura
    for (let item of productos) {
      let productoDB;

      if (item.nuevoProducto) {
        // Crear nuevo producto si no existe
        productoDB = new Product({
          ...item.nuevoProducto,
          proveedor: proveedor || invoice.proveedor,
        });
        await productoDB.save();
        item.producto = productoDB._id;
      } else {
        productoDB = await Product.findById(item.producto);
        if (!productoDB) {
          return res.status(404).json({
            success: false,
            message: `Producto con ID ${item.producto} no encontrado`,
          });
        }
      }

      const cantidad = Number(item.cantidad);
      const costoUnitario = Number(item.costoUnitario || productoDB.costoUnitario);

      // ✅ Reemplazar la cantidad directamente (no sumar)
      productoDB.cantidad = cantidad;
      productoDB.valorInventario = productoDB.cantidad * productoDB.costoUnitario;
      productoDB.factura = invoice._id;

      // Subtotal en la factura
      item.subtotal = cantidad * costoUnitario;
      totalFactura += item.subtotal;

      await productoDB.save();
      delete item.nuevoProducto;
    }

    // Guardar cambios en la factura
    invoice.productos = productos;
    invoice.total = totalFactura;

    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("proveedor", "name email number")
      .populate(
        "productos.producto",
        "nombreArticulo sku costoUnitario cantidad valorInventario imagenes"
      );

    res.json({
      success: true,
      message: "Factura actualizada exitosamente (cantidades reemplazadas)",
      invoice: populatedInvoice,
    });
  } catch (error) {
    console.error("Error al actualizar factura:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la factura",
      error: error.message || error,
    });
  }
};




// Soft delete (status: false)
export const softDeleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInvoice = await Invoice.findByIdAndUpdate(id, { status: false }, { new: true });

    if (!deletedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Factura eliminada (soft) correctamente",
      invoice: deletedInvoice,
    });
  } catch (error) {
    console.error("Error al eliminar factura:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar factura",
      error,
    });
  }
};

// Hard delete
export const hardDeleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInvoice = await Invoice.findByIdAndDelete(id);

    if (!deletedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Factura eliminada permanentemente",
      invoice: deletedInvoice,
    });
  } catch (error) {
    console.error("Error al eliminar factura:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar factura",
      error,
    });
  }
};
