import cartModel from "../../../../DB/model/Cart.model.js"
import productModel from "../../../../DB/model/Product.model.js"

// clear cart
export const clearCart = async (userId) => {
    await cartModel.findOneAndUpdate({userId}, {products:[]})
}

// update stock
export const udpateStock = async (products) => {
    for (const product of products) {
        await productModel.findByIdAndUpdate( product.productId, {
            $inc: {
                stock: -product.quantity
            }
        })
    }
}