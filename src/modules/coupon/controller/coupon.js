import { couponModel } from "../../../../DB/model/Coupon.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import voucher_codes from "voucher-code-generator";

// create
export const createCoupon = asyncHandler( async ( req, res, next ) => {
    // generate code
    const code = voucher_codes.generate( { length: 5 } );// []

    // create coupon
    const coupon = await couponModel.create( {
        name: code[0],
        discount: req.body.discount,
        expiredAt: new Date( req.body.expiredAt ).getTime(), // 12/25/2023
        createdBy: req.user._id
    })
    return res.status(201).json( { messge: "Done" , coupon} );
} )

// update
export const updateCoupon = asyncHandler( async ( req, res, next ) => {
    // check code
    const coupon = await couponModel.findOne( { name: req.params.code, expiredAt: { $gt: Date.now() } } );
    if ( !coupon ) return next( new Error( 'Invalid code!' ) )
    
    // check owner 
    if ( req.user._id !== coupon.createdBy )
        return next( new Error( "You are not the owner!" ) );

    // add discount and expiredAt if exist
    coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
    coupon.expiredAt = req.body.expiredAt ? new Date( req.body.expiredAt ).getTime() : coupon.expiredAt;
    await coupon.save()

    return res.json( { message: 'Done' , coupon} );
} )


// delete 
export const deleteCoupon = asyncHandler( async ( req, res, next ) => {
    // check coupon
    const coupon = await couponModel.findOne( { name: req.params.code } );
    if ( !coupon ) return next( new Error( 'Invalid code!' ) )
    
    // check owner 
    if ( req.user.id != coupon.createdBy )
        return next( new Error( "You are not the owner!" ) );

    // delete 
    await couponModel.deleteOne( { name: req.params.code } );

    return res.json( { message: "Done" } );
} )

// get all coupons
export const allCoupons = asyncHandler( async ( req, res, next ) => {
    const coupons = await couponModel.find();

    return res.json( { message: "Done", coupons } );
})