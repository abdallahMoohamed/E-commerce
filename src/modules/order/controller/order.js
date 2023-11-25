import cartModel from "../../../../DB/model/Cart.model.js";
import { couponModel } from "../../../../DB/model/Coupon.model.js";
import { orderModel } from "../../../../DB/model/Order.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import { createInvoice } from "../../../utils/createInvoice.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { fileURLToPath } from 'url'
import path from 'path'
import cloudinary from "../../../utils/cloudinary.js";
import sendEmail from "../../../utils/email.js";
import { clearCart, udpateStock } from "./order.service.js";
const __dirname = path.dirname( fileURLToPath( import.meta.url ) )

export const createOrder = asyncHandler( async ( req, res, next ) => {
    // data
    const { payment, address, phone, coupon } = req.body

    // check cuopon 
    let checkCoupon;
    if ( coupon ) {
        checkCoupon = await couponModel.find( {
            name: coupon,
            expiredAt: { $gt: Date.now() }
        } )
        if ( !checkCoupon ) {
            return next( new Error( 'In-valid coupon!' ) )
        }
    }

    // check cart
    const cart = await cartModel.findOne( { userId: req.user._id } );
    const products = cart.products;
    if ( !products ) return next( new Error( 'Empty cart!' ) )

    // check products
    let orderProducts = [];
    let orderPrice = 0;
    for ( let i = 0; i < products.length; i++ ) {
        //check product existance 
        const product = await productModel.findById( products[i].productId );
        if ( !product )
            return next( new Error( `product ${ products[i].productId } not found!` ) );
        //check product stock
        if ( product.stock < products[i].quantity )
            return next( new Error( `${ product.name } out of the stock, only ${ product.stock } items are left !` ) )

        // prepare orderProducts
        orderProducts.push( {
            productId: product._id,
            quantity: products[i].quantity,
            name: product.name,
            itemPrice: product.price,
            totalPrice: products[i].quantity * product.price
        } )

        // calculate orederPrice
        orderPrice += products[i].quantity * product.price

    }

    // create order 
    const order = await orderModel.create( {
        user: req.user._id,
        products: orderProducts,
        address,
        phone,
        coupon: {
            id: checkCoupon?._id,
            name: checkCoupon?.name,
            discount: checkCoupon?.discount
        },
        payment,
        price: orderPrice

    } )

    // generate invoice 
    const user = req.user
    const invoice = {
        shipping: {
            name: user.userName,
            address: order.address,
            country: "Egypt"
        },
        items: order.products,
        subtotal: order.price,
        paid: order.finalPrice,
        invoice_nr: order._id
    }
    const pdfPath = path.join( __dirname, `../../../../invoiceTemp/${ order._id }.pdf` )
    createInvoice( invoice, pdfPath )

    // upload cloudinary 
    const { secure_url, public_id } = await cloudinary.uploader.upload( pdfPath, {
        folder: `E-commerce/order/invoice/${ user._id }`
    } )

    console.log({secure_url});
    // TODO delete file from filesystem
    // add invoice to order
    order.invoice = { id: public_id, url: secure_url };
    await order.save();

    console.log( `email : ${user.email}` );

    //send email 
    const isSent = await sendEmail( {
        to:'abdullamoohammed@gmail.com',
        subject: 'Order Invoice',
        attachments: [
            {
                contentType: 'application/pdf',
                path: secure_url,
            }
        ]
    } )
    console.log( 'before' );
    // if ( isSent ) {
    //     // update stock 
    //     udpateStock( order.products )
    //     // clear cart 
    //     clearCart( user._id );
    //     console.log( "inside" );
    // }

    console.log( 'after' );
    // response 
    return res.json( { success: true, message: 'order placed succssfully! please check your email!' } )
} )