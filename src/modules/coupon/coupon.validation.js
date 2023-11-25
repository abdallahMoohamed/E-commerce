import joi from 'joi'

export const createCouponSchema = {
    body: joi.object().required().keys( {
        discount: joi.number().min( 1 ).max( 100 ).required(),
        expiredAt: joi.date().greater( Date.now() ).required()
    } ),
    params: joi.object().required().keys( {} ),
    query: joi.object().required().keys( {} )
}
export const updateCouponSchema = {
    body: joi.object().required().keys( {
        discount: joi.number().min( 1 ).max( 100 ),
        expiredAt: joi.date().greater( Date.now() )
    } ),
    params: joi.object().required().keys( {
        code: joi.string().length(5).required()
    } ),
    query: joi.object().required().keys( {} )
}
export const deleteCouponSchema = {
    body: joi.object().required().keys( {} ),
    params: joi.object().required().keys( {
        code: joi.string().length(5).required()
    } ),
    query: joi.object().required().keys( {} )
}