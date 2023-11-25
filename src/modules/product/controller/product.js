import slugify from "slugify";
import brandModel from "../../../../DB/model/Brand.model.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import {
	ReasonPhrases,
	StatusCodes,
} from 'http-status-codes';
import cloudinary from "../../../utils/cloudinary.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { genrateQRcode } from "../../../utils/qrcode.js";
import { ApiFeature } from "../../../utils/apiFeature.js";

// add product 
export const addProduct = asyncHandler( async ( req, res, next ) => {
    // to add createdby to information of product
    req.body.createdBy = req.user._id;

    req.body.name = req.body.name.toLowerCase();
    // check if name exist or not "I am updated the code of this method"
    const product = await productModel.findOne( { name: req.body.name } )
    if ( product ) {
        if (
            req.body.categoryId == product.categoryId &&
            req.body.subCategoryId == product.subCategoryId &&
            req.body.brandId == product.brandId
            
        ) {
            product.stock = product.stock + parseInt( req.body.quantity )
            await product.save(); // to save product with new stock
            return res.status( StatusCodes.CREATED ).json( { message: 'Done', product } );

        } else {
            return next( new ErrorClass( `Product ${ req.body.name } is already exist` ) );
        }
    }

    // check  Category, Subcategory and brand is exist or not
    const isCategoryExist = await categoryModel.findById( req.body.categoryId )
    if ( !isCategoryExist ) {
        return next( new ErrorClass( 'Not Found This Category',  StatusCodes.NOT_FOUND ) );
    }
    const isSubcategoryExist = await subCategoryModel.findById( req.body.subCategoryId )
    if ( !isSubcategoryExist ) {
        return next( new ErrorClass( 'Not Found This SubCategory',  StatusCodes.NOT_FOUND ) );
    }
    const isBrandExist = await brandModel.findById( req.body.brandId )
    if ( !isBrandExist ) {
        return next( new ErrorClass( 'Not Found This Brand',   StatusCodes.NOT_FOUND  ) );
    }

    // to add slug, stock and paymentprice to req.body
    req.body.slug = slugify( req.body.name );
    req.body.stock = req.body.quantity;
    req.body.paymentPrice = req.body.price - ( req.body.price * ( ( req.body.discount || 0 ) / 100 ) );
    if ( req.body.sizes ) {
        req.body.sizes = JSON.parse( req.body.sizes );
    }
    if ( req.body.colors ) {
        req.body.colors = JSON.parse( req.body.colors );
    }

    // upload image on cloudinary 
    const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.image[0].path,
        { folder: `E-commerce/product/images` }
    );
    req.body.image = { secure_url, public_id }
    
    // check the covers are exist 
    if ( req.files.coverImages?.length > 0 ) {
        const coverImages = [];
        for (let i = 0; i < req.files.coverImages.length; i++) {
            let { secure_url, public_id } = await cloudinary.uploader.upload(
                req.files.coverImages[i].path,
                {folder:'E-commerce/product/covers'}
            );
            coverImages.push( { secure_url, public_id } );
        }
        req.body.coverImages = coverImages;
    }

    // genrate QRcode 
    req.body.QRcode = await genrateQRcode( {
        name: req.body.name,
        description: req.body.description,
        imageURL: req.body.image.secure_url,
        price: req.body.price,
        paymentPrice: req.body.paymentPrice
    } )
    
    // save all data on database
    const productIsCreated = await productModel.create( req.body );

    return res.status( StatusCodes.CREATED ).json( { message: 'Done', product: productIsCreated } );
} )


// get all product 
export const getAllProducts = asyncHandler( async ( req, res, next ) => {
    const mongooseQuery = productModel.find().populate( [{
        path:'categoryId'
    }])
    const apiFeature = new ApiFeature(mongooseQuery , req.query );
    apiFeature.pagination().filter().sort().search().select();
    const products = await apiFeature.mongooseQuery;

    const numberOfProducts = await productModel.countDocuments();

    return res.status( StatusCodes.ACCEPTED )
        .json( {
            message: 'Done',
            products,
            productsCount: numberOfProducts,
            totalPages: apiFeature.totalPages(numberOfProducts),
            page: apiFeature.getPage()
        } );  

} )


