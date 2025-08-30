import Invoice from "./invoice.model.js";
import Product from "../products/product.model.js";

// Crear factura (productos existentes o nuevos)
export const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json({
      success: true,
      message: "Factura creada exitosamente",
      invoice,
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
      .populate("productos.producto", "nombreArticulo sku costoUnitario");

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

// Editar factura (actualizar datos y productos existentes)
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCompra, noFactura, serieFactura, proveedor, productos } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Factura no encontrada" });
    }

    // Actualizar datos básicos
    if (fechaCompra) invoice.fechaCompra = fechaCompra;
    if (noFactura) invoice.noFactura = noFactura;
    if (serieFactura) invoice.serieFactura = serieFactura;
    if (proveedor) invoice.proveedor = proveedor;

    let totalFactura = 0;

    for (let item of productos) {
      let productoDB;

      // Nuevo producto
      if (item.nuevoProducto) {
        productoDB = new Product({
          ...item.nuevoProducto,
          proveedor: proveedor || invoice.proveedor,
        });
        await productoDB.save();
        item.producto = productoDB._id;
      } else {
        // Producto existente
        productoDB = await Product.findById(item.producto);
        if (!productoDB) {
          return res.status(404).json({ success: false, message: `Producto con ID ${item.producto} no encontrado` });
        }
      }

      // Asignar costo unitario desde Product si no viene
      if (!item.costoUnitario || item.costoUnitario === 0) {
        item.costoUnitario = productoDB.costoUnitario;
      }

      // Calcular subtotal
      item.subtotal = item.cantidad * item.costoUnitario;

      // Actualizar stock del producto
      productoDB.stock += item.cantidad;
      await productoDB.save();

      totalFactura += item.subtotal;

      // Limpiar auxiliar para no guardar en DB
      delete item.nuevoProducto;
    }

    invoice.productos = productos;
    invoice.total = totalFactura;

    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("proveedor", "name email number")
      .populate("productos.producto", "nombreArticulo sku costoUnitario");

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
