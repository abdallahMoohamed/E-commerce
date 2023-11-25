import joi from 'joi'


export const addProductsVal = {
    body: joi.object().required().keys( {
        address: joi.string().min( 10 ).required(),
        coupon: joi.string().length( 5 ),
        phone: joi.string().required(),
        payment: joi.string().valid( 'cash', 'card' ).required(),
    } ),
    files: joi.object().required().keys( {} ),
    params: joi.object().required().keys( {} ),
    query: joi.object().required().keys( {} )
}