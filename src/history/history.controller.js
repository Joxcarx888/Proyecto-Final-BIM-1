import History from "./history.model.js"
import Product from "../products/product.model.js"
import User from "../users/user.model.js"
import jwt from "jsonwebtoken"

import { 
  validateWithdrawProduct, 
  validateRegisterProduct 
} from "../middlewares/validar-historial.js";

export const registerProduct = async (req, res) => {
  try {
    await validateRegisterProduct(req,res)
    if (res.statusCode !== 200) return;
    const token = await req.header('x-token')
    const { quantity } = req.body
    const { id } = req.params
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
    const currentProduct = await Product.findById(id)
    const currentUser = await User.findById(uid)
    const fecha = new Date();
    const dateToIzo = fecha.toISOString();
    const dateCompleted = dateToIzo.replace('Z', '+00:00');
    const newRegistration = await History.create({
      quantity: quantity,
      date: dateCompleted,
      employee: currentUser.id,
      employeeName: currentUser.name,
      product: currentProduct.id,
      productName: currentProduct.name
    })
    console.log(newRegistration)

    await newRegistration.save()

    const stockRemaining = currentProduct.stock + quantity
    await Product.findByIdAndUpdate(currentProduct.id, { stock: stockRemaining }, { new: true })

    return res.status(200).json({
      succes: true,
      message: "Products withdrawn successfuly",
      newRegistration
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering the product",
      error,
    })
  }
}

export const withdrawProduct = async (req, res) => {
  console.log('hola')
  try {
    await validateWithdrawProduct(req,res)
    if (res.statusCode !== 200) return;
    const token = await req.header('x-token')
    const { quantity, motive, destiny} = req.body
    const { id } = req.params
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
    const currentProduct = await Product.findById(id)
    const currentUser = await User.findById(uid)
    const fecha = new Date();
    const dateToIzo = fecha.toISOString();
    const dateCompleted = dateToIzo.replace('Z', '+00:00');
    const newRegistration = await History.create({
      quantity: quantity * -1,
      motive,
      destiny,
      date: dateCompleted,
      employee: currentUser.id,
      employeeName: currentUser.name,
      product: currentProduct.id,
      productName: currentProduct.name
    })
    console.log(newRegistration)

    await newRegistration.save()

    const stockRemaining = currentProduct.stock - quantity
    await Product.findByIdAndUpdate(currentProduct.id, { stock: stockRemaining }, { new: true })

    return res.status(200).json({
      succes: true,
      message: "Products withdrawn successfuly",
      newRegistration
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error withdrawing the product",
      error,
    })
  }
}

export const getHistory = async (req, res) => {
  try {
    const history = await History.find({ status: true })
    res.status(200).json({
      success: true,
      mssg: "History found successfuly",
      history
    })
  } catch (error) {
    res.status(500).json({
      success: true,
      mssg: 'Error getting history',
      error
    })
  }
}