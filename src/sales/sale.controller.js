import Sale from "./sale.model.js";
import Product from "../products/product.model.js";

// Crear venta
export const createSale = async (req, res) => {
  try {
    const saleData = req.body;

    const sale = new Sale(saleData);
    await sale.save();

    const populatedSale = await Sale.findById(sale._id)
        .populate("cliente", "nombre nit")   // 👈 solo nombre y nit
        .populate("productos.producto", "nombreArticulo sku valorReal cantidad");

    res.status(201).json({
      success: true,
      message: "Venta creada exitosamente",
      sale: populatedSale,
    });
  } catch (error) {
    console.error("Error al crear venta:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la venta",
      error: error.message || error,
    });
  }
};

// Listar ventas
export const listSales = async (req, res) => {
  try {
    const sales = await Sale.find({ status: true })
      .populate("cliente", "nombre nit")
      .populate("productos.producto", "nombreArticulo sku valorReal cantidad");

    res.json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error("Error al listar ventas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener ventas",
      error,
    });
  }
};

// Editar venta
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaVenta, cliente, productos } = req.body;

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ success: false, message: "Venta no encontrada" });
    }

    // 🔄 Revertir stock de los productos de la venta anterior
    if (sale.productos && sale.productos.length > 0) {
      await Promise.all(
        sale.productos.map(async (oldItem) => {
          const oldProduct = await Product.findById(oldItem.producto);
          if (oldProduct) {
            // Devolver al stock lo que se vendió antes
            oldProduct.cantidad += Number(oldItem.cantidad);
            await oldProduct.save();
          }
        })
      );
    }

    // ✅ Actualizar datos básicos
    if (fechaVenta) sale.fechaVenta = fechaVenta;
    if (cliente) sale.cliente = cliente;

    let totalVenta = 0;

    // Procesar los nuevos productos
    for (let item of productos) {
      const productoDB = await Product.findById(item.producto);
      if (!productoDB) {
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${item.producto} no encontrado`,
        });
      }

      item.cantidad = Number(item.cantidad);
      item.precioVenta = productoDB.valorReal;

      const subtotalSinDesc = item.precioVenta * item.cantidad;
      const montoDescuento = subtotalSinDesc * (item.descuento / 100);
      item.subtotal = subtotalSinDesc - montoDescuento;

      totalVenta += item.subtotal;

      // Restar del stock nuevamente con la nueva cantidad
      if (productoDB.cantidad < item.cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para el producto ${productoDB.nombreArticulo}`,
        });
      }

      productoDB.cantidad -= item.cantidad;
      await productoDB.save();
    }

    sale.productos = productos;
    sale.totalVenta = totalVenta;

    await sale.save();

    const populatedSale = await Sale.findById(sale._id)
      .populate("cliente", "nombre nit")
      .populate("productos.producto", "nombreArticulo sku valorReal cantidad");

    res.json({
      success: true,
      message: "Venta actualizada exitosamente",
      sale: populatedSale,
    });
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la venta",
      error: error.message || error,
    });
  }
};

// Soft delete (status: false)
export const softDeleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSale = await Sale.findByIdAndUpdate(id, { status: false }, { new: true });

    if (!deletedSale) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Venta eliminada (soft) correctamente",
      sale: deletedSale,
    });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar venta",
      error,
    });
  }
};

// Hard delete
export const hardDeleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSale = await Sale.findByIdAndDelete(id);

    if (!deletedSale) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Venta eliminada permanentemente",
      sale: deletedSale,
    });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar venta",
      error,
    });
  }
};
