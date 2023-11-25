import slugify from "slugify";
import brandModel from "../../../../DB/model/Brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import {
	ReasonPhrases,
	StatusCodes,
} from 'http-status-codes';
import { ErrorClass } from "../../../utils/errorClass.js";
import { ApiFeature } from "../../../utils/apiFeature.js";
import productModel from "../../../../DB/model/Product.model.js";


export const addBrand = asyncHandler( async ( req, res, next ) => {
    const userId = req.user._id;
    let { name } = req.body;
    name = name.toLowerCase();
    ////// check is exist or not //////
    const brand = await brandModel.findOne( { name } );
    if ( brand ) {
        return next( new ErrorClass( `Brand ${ name } is already exist`,StatusCodes.CONFLICT ) ); 
    }
    // 1- upload image on cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload( req.file.path,{folder:'E-commerce/brand'} );
    // 2- save data on db
    const brandIsCreated = await brandModel.create( {
        name,
        slug: slugify( name ),
        image: { secure_url, public_id },
        createdBy: userId
    })

    return res.status( StatusCodes.CREATED ).json( { message: 'Done', brandIsCreated } );
} )

export const getAllBrands = asyncHandler( async ( req, res, next ) => {
    const mongooseQuery = brandModel.find();
    const apiFeature = new ApiFeature( mongooseQuery, req.query );
    apiFeature.pagination().filter().search().select().sort();
    const brands = await apiFeature.mongooseQuery;

    return res.json( { message: 'Done', brands } );
} )

export const updateBrand = asyncHandler( async ( req, res, next ) => {
    const brandId  = req.params.id
    ///////// check brand is exist /////////
    const brand = await brandModel.findById( brandId );
    if ( !brand ) {
        return next( new ErrorClass( 'Not Found The Brand', StatusCodes.NOT_FOUND ) );
    }
    ///////// check the name already exist with aother brand? /////////
    if ( req.body.name ) {
        req.body.name = req.body.name.toLowerCase();
        const nameExist = await brandModel.findOne( { name: req.body.name } );
        if ( nameExist ) {
            return next( new ErrorClass( 'This name is already exist', StatusCodes.CONFLICT ) )
        }
        req.body.slug = slugify( req.body.name );
    }
    ///////// update image if exist /////////
    if ( req.file ) {
        // 1-update on cloudinary        
        const { secure_url } = await cloudinary.uploader.upload(
            req.file.path,
            {
                public_id: brand.image.public_id
            }
        )
        req.body.image = {
            secure_url,
            public_id: brand.image.public_id
        };

    }

    // 2-update on database 
    const updatedBrand = await brandModel.findByIdAndUpdate( brand._id, req.body, { new: true } )

    return res.json( { message: 'Done', result: updatedBrand } );
    
} )

export const deleteBrand = asyncHandler( async ( req, res, next ) => {
    const brandId = req.params.id;
    ///////// find and delete from db /////////
    const brand = await brandModel.findByIdAndDelete( brandId );
    if ( !brand ) {
        return next( new ErrorClass( 'Not Found brand', StatusCodes.NOT_FOUND  ) );
    }
    ///////// delete from cloudinary /////////
    await cloudinary.uploader.destroy( brand.image.public_id );


    ///////// delete products for this brand /////////
    const products = await productModel.find( { brandId } );
    // remove from cloudinary
    for (const product of products) {
        await cloudinary.uploader.destroy( product.image.public_id );
    }
    // remove from db
    await productModel.deleteMany( { brandId } );
    
    return res.status( StatusCodes.ACCEPTED ).json( { message: "Done" , brand} );
} )

export const getBrandById = asyncHandler( async ( req, res, next ) => {
    const brandId  = req.params.id;
    const brand = await brandModel.findById( brandId );    
    if ( !brand ) {
        return next(new ErrorClass('Not Found brand',StatusCodes.NOT_FOUND))
    }
    return res.json( { message: 'Done' , brand} );
} )

