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
// Editar factura (ajusta stock correctamente según diferencia)
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCompra, noFactura, serieFactura, proveedor, productos } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Factura no encontrada" });
    }

    // Actualizar datos básicos de la factura
    if (fechaCompra) invoice.fechaCompra = fechaCompra;
    if (noFactura) invoice.noFactura = noFactura;
    if (serieFactura) invoice.serieFactura = serieFactura;
    if (proveedor) invoice.proveedor = proveedor;

    let totalFactura = 0;

    if (productos && productos.length > 0) {
      await Promise.all(
        productos.map(async (newItem) => {
          let productoDB;

          if (newItem.nuevoProducto) {
            // Crear nuevo producto si no existe
            productoDB = new Product({
              ...newItem.nuevoProducto,
              proveedor: proveedor || invoice.proveedor,
            });
            await productoDB.save();
            newItem.producto = productoDB._id;
          } else {
            productoDB = await Product.findById(newItem.producto);
            if (!productoDB) {
              throw new Error(`Producto con ID ${newItem.producto} no encontrado`);
            }
          }

          const cantidadNueva = Number(newItem.cantidad);
          const costoUnitario = Number(newItem.costoUnitario || productoDB.costoUnitario);

          // Buscar cantidad anterior en la factura
          const oldItem = invoice.productos.find(
            (p) => String(p.producto) === String(newItem.producto)
          );
          const cantidadAnterior = oldItem ? Number(oldItem.cantidad) : 0;

          // ✅ Ajustar stock según diferencia
          const diferencia = cantidadNueva - cantidadAnterior;
          productoDB.cantidad += diferencia;
          if (productoDB.cantidad < 0) productoDB.cantidad = 0; // evitar negativos
          productoDB.valorInventario = productoDB.cantidad * productoDB.costoUnitario;
          productoDB.factura = invoice._id;

          // Subtotal en la factura
          newItem.subtotal = cantidadNueva * costoUnitario;
          totalFactura += newItem.subtotal;

          await productoDB.save();
          delete newItem.nuevoProducto;
        })
      );

      invoice.productos = productos;
      invoice.total = totalFactura;
    }

    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("proveedor", "name email number")
      .populate(
        "productos.producto",
        "nombreArticulo sku costoUnitario cantidad valorInventario imagenes"
      );

    res.json({
      success: true,
      message: "Factura actualizada exitosamente",
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
