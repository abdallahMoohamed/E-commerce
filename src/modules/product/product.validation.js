import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

const arrayParsing = ( value, helper ) => {
    value = JSON.parse( value );
    const valueSchema = joi.object( {
        value: joi.array().items( joi.string().alphanum() )
    } )
    const valiationRes = valueSchema.validate( { value } )
    if ( valiationRes.error ) {
        return helper.message( valiationRes.error.details );
    }
    return true;
};

export const addProductsVal = {
    body: joi.object().required().keys( {
        name: generalFields.name.required(),
        description: generalFields.name.min( 20 ).required(),
        price: joi.number().min( 0 ).positive().required(),
        discount: joi.number().min( 0 ).max( 100 ).positive(),
        quantity: joi.number().positive().integer(),
        colors: joi.custom(arrayParsing),
        sizes: joi.custom( arrayParsing ),
        categoryId: generalFields.id,
        subCategoryId: generalFields.id,
        brandId: generalFields.id
    } ),
    files: joi.object().keys( {
        image: joi.array().items( generalFields.file ).length(1).required(),
        coverImages: joi.array().items( generalFields.file ).max( 5 )
    }).required(),
    params: joi.object().required().keys( {} ),
    query: joi.object().required().keys( {})
}