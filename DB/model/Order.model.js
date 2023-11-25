import { Schema, Types, model } from "mongoose";

export const orderSchema = new Schema( {
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        productId: {
            type: Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        itemPrice: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        }

    }],
    price: {
        type: Number,
        required: true
    },
    coupon: {
        id: { type: Types.ObjectId, ref: 'Coupon' },
        name: String,
        discount: { type: Number, min: 1, max: 100 }
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            'pending', // for credit cart
            'confirmed', // for credit cart
            'placed', // for cash
            'on way',
            'deliveres',
            'canceled', // if cancele before deliverd 
            'refunded', // if cancele when deliverd 
        ],
        default: 'placed'
    },
    payment: {
        type: String,
        enum: ['cash', 'card'],
        default: 'cash'
    },
    invoice: {
        id: String,
        url: String
    }


}, { timestamps: true } )

orderSchema.virtual( "finalPrice" ).get( function () {
    return this.coupon
        ? Number.parseFloat(
            this.price - ( this.price * this.coupon.discount ) / 100
        ).toFixed( 2 )
        : this.price

} )

export const orderModel = model( 'Order', orderSchema );