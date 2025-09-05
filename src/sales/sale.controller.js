import Sale from "./sale.model.js";
import Product from "../products/product.model.js";

export const createSale = async (req, res) => {
  try {
    const saleData = req.body;
    const productosDB = [];

    // 1️⃣ Validar stock para todos los productos
    for (let item of saleData.productos) {
      const productoDB = await Product.findById(item.producto);
      if (!productoDB) {
        return res.status(404).json({ success: false, message: `Producto ${item.producto} no encontrado` });
      }

      const cantidad = Number(item.cantidad || 0);
      if (productoDB.cantidad < cantidad) {
        return res.status(400).json({ success: false, message: `Stock insuficiente para ${productoDB.nombreArticulo}` });
      }

      productosDB.push({ db: productoDB, cantidad, descuento: item.descuento || 0 });
    }

    // 2️⃣ Restar stock y calcular subtotales
    let totalVenta = 0;
    const productosProcesados = productosDB.map(({ db: productoDB, cantidad, descuento }) => {
      productoDB.cantidad -= cantidad;
      productoDB.valorInventario = productoDB.cantidad * productoDB.costoUnitario;

      const precioVenta = productoDB.valorReal;
      const subtotal = precioVenta * cantidad - (precioVenta * cantidad * (descuento / 100));
      totalVenta += subtotal;

      return { producto: productoDB._id, cantidad, descuento, precioVenta, subtotal };
    });

    // 3️⃣ Guardar stock actualizado
    await Promise.all(productosDB.map(p => p.db.save()));

    // 4️⃣ Crear la venta
    const sale = new Sale({
      fechaVenta: saleData.fechaVenta,
      cliente: saleData.cliente,
      productos: productosProcesados,
      totalVenta,
    });
    await sale.save();

    const populatedSale = await Sale.findById(sale._id)
      .populate("cliente", "nombre nit")
      .populate("productos.producto", "nombreArticulo sku valorReal cantidad valorInventario");

    res.status(201).json({
      success: true,
      message: "Venta creada exitosamente",
      sale: populatedSale,
    });
  } catch (error) {
    console.error("Error al crear venta:", error);
    res.status(500).json({ success: false, message: "Error al crear la venta", error: error.message || error });
  }
};



// Listar ventas
export const listSales = async (req, res) => {
  try {
    const sales = await Sale.find({ status: true })
      .populate("cliente", "nombre nit")
      .populate("productos.producto", "nombreArticulo sku valorReal cantidad valorInventario");

    res.json({ success: true, sales });
  } catch (error) {
    console.error("Error al listar ventas:", error);
    res.status(500).json({ success: false, message: "Error al obtener ventas", error });
  }
};

// Editar venta (ajustando stock por diferencia)
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaVenta, cliente, productos } = req.body;

    const sale = await Sale.findById(id);
    if (!sale) return res.status(404).json({ success: false, message: "Venta no encontrada" });

    if (fechaVenta) sale.fechaVenta = fechaVenta;
    if (cliente) sale.cliente = cliente;

    let totalVenta = 0;

    // 1️⃣ Devolver stock de productos anteriores
    for (let oldItem of sale.productos) {
      const productoDB = await Product.findById(oldItem.producto);
      if (productoDB) {
        productoDB.cantidad += Number(oldItem.cantidad || 0);
        productoDB.valorInventario = productoDB.cantidad * productoDB.costoUnitario;
        await productoDB.save();
      }
    }

    // 2️⃣ Validar stock de nuevos productos
    for (let newItem of productos) {
      const productoDB = await Product.findById(newItem.producto);
      if (!productoDB) return res.status(404).json({ success: false, message: `Producto ${newItem.producto} no encontrado` });

      const cantidadNueva = Number(newItem.cantidad || 0);
      if (productoDB.cantidad < cantidadNueva) {
        return res.status(400).json({ success: false, message: `Stock insuficiente para ${productoDB.nombreArticulo}` });
      }
    }

    // 3️⃣ Restar stock de nuevos productos y calcular subtotales
    const productosProcesados = [];
    for (let newItem of productos) {
      const productoDB = await Product.findById(newItem.producto);
      const cantidadNueva = Number(newItem.cantidad || 0);

      productoDB.cantidad -= cantidadNueva;
      productoDB.valorInventario = productoDB.cantidad * productoDB.costoUnitario;
      await productoDB.save();

      const precioVenta = productoDB.valorReal;
      const subtotal = precioVenta * cantidadNueva - (precioVenta * cantidadNueva * ((newItem.descuento || 0) / 100));
      totalVenta += subtotal;

      productosProcesados.push({
        producto: productoDB._id,
        cantidad: cantidadNueva,
        descuento: newItem.descuento || 0,
        precioVenta,
        subtotal,
      });
    }

    // 4️⃣ Guardar la venta actualizada
    sale.productos = productosProcesados;
    sale.totalVenta = totalVenta;
    await sale.save();

    const populatedSale = await Sale.findById(sale._id)
      .populate("cliente", "nombre nit")
      .populate("productos.producto", "nombreArticulo sku valorReal cantidad valorInventario");

    res.json({ success: true, message: "Venta actualizada exitosamente", sale: populatedSale });
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    res.status(500).json({ success: false, message: "Error al actualizar la venta", error: error.message || error });
  }
};

// Soft delete
export const softDeleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSale = await Sale.findByIdAndUpdate(id, { status: false }, { new: true });
    if (!deletedSale) return res.status(404).json({ success: false, message: "Venta no encontrada" });

    res.json({ success: true, message: "Venta eliminada (soft) correctamente", sale: deletedSale });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    res.status(500).json({ success: false, message: "Error al eliminar venta", error });
  }
};

// Hard delete
export const hardDeleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSale = await Sale.findByIdAndDelete(id);
    if (!deletedSale) return res.status(404).json({ success: false, message: "Venta no encontrada" });

    res.json({ success: true, message: "Venta eliminada permanentemente", sale: deletedSale });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    res.status(500).json({ success: false, message: "Error al eliminar venta", error });
  }
};
