import { StatusCodes } from "http-status-codes";
import productModel from "../../../../DB/model/Product.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import cartModel from "../../../../DB/model/Cart.model.js";




export const addToCart = asyncHandler( async ( req, res, next ) => {
    // get data 
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    // check product exist ?
    const product = await productModel.findById( productId );
    if ( !product ) {
        return next( new ErrorClass( 'Product not found ', StatusCodes.NOT_FOUND ) );
    }
    // check stock 
    if ( quantity > product.stock ) {
        return next( new ErrorClass( `Sorry, only ${ product.stock } items left on the stock!`, StatusCodes.BAD_GATEWAY ) );
    }


    // check if this product already exist in cart or not 
    const cart = await cartModel.findOne( { userId } )
    const productIndext = cart.products.findIndex( ele => {
        return ele.productId == productId
    } )
    if ( productIndext == -1 ) {
        cart.products.push( { productId, quantity } );
    } else {
        cart.products[productIndext].quantity = quantity;
    }
    await cart.save();

    return res.status( StatusCodes.ACCEPTED ).json( { message: 'done', cart } );
} )

export const getUserCart = asyncHandler( async ( req, res, next ) => {
    const userId = req.user._id;
    const cart = await cartModel.findOne( { userId } ).populate( [{
        path: 'products.productId',
        select: 'name stock price discount paymentPrice'
    }] )

    let totalPrice = 0;
    cart.products = cart.products.filter( ele => {
        if ( ele.productId ) {
            totalPrice += ele.productId.paymentPrice * ele.quantity;
            return ele;
        }
    } );
    await cart.save();

    return res.json( { message: 'done', cart, totalPrice } )
} )


export const updateCart = asyncHandler( async ( req, res, next ) => {
    // get data 
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    // check product exist ?
    const product = await productModel.findById( productId );
    if ( !product ) {
        return next( new ErrorClass( 'Product not found ', StatusCodes.NOT_FOUND ) );
    }
    // check stock 
    if ( quantity > product.stock ) {
        return next( new ErrorClass( `Sorry, only ${ product.stock } items left on the stock!`, StatusCodes.BAD_GATEWAY ) );
    }

    // update 
    const cart = await cartModel.findOneAndUpdate(
        { userId, "products.productId": productId }, // "products.productId" to get productId from products 
        { $set: { "products.$.quantity": quantity } },// "products.$.quantity" to get quantity of this productId
        { new: true }
    )
    // res 
    return res.json( { success: true, cart } )
} )


export const removeProductFromCart = asyncHandler( async ( req, res, next ) => {
    // remove 
    const cart = await cartModel.findOneAndUpdate(
        { userId: req.user._id },
        { $pull: { products: { productId: req.params.productId } } },
        { new: true }
    )

    //response 
    return res.json( { success: true, cart } );
} )


export const clearCart = asyncHandler( async ( req, res, next ) => {
    // clear cart 
    const cart = await cartModel.findOneAndUpdate(
        { userId: req.user._id },
        { products: [] },
        { new: true }
    )

    //response 
    return res.json( { success: true, cart } )

} )