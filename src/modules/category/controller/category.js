import slugify from "slugify";
import categoryModel from "../../../../DB/model/Category.model.js";
import cloudinary from '../../../utils/cloudinary.js'
import { asyncHandler } from "../../../utils/errorHandling.js";
import {
	ReasonPhrases,
	StatusCodes,
} from 'http-status-codes';
import { ErrorClass } from "../../../utils/errorClass.js";
import { ApiFeature } from "../../../utils/apiFeature.js";
import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import productModel from "../../../../DB/model/Product.model.js";

export const addCategory = asyncHandler( async ( req, res, next ) => {
    const userId = req.user._id; 
    let { name } = req.body;
    name = name.toLowerCase();
    
    const isExist = await categoryModel.findOne( { name } );
    if ( isExist ) {
        return next( new ErrorClass( 'This name already exist', StatusCodes.CONFLICT ) );
    }
    const slug = slugify( name ); // defualt -
    // 1- upload image on cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {folder:`E-commerce/category`}
    );
    // 2- save data on db
    const category = await categoryModel.create( {
        name,
        slug,
        image: { secure_url, public_id },
        createdBy: userId
    } );
    
    return res.status(StatusCodes.CREATED).json( { message: "Done" , category, status:ReasonPhrases.CREATED} );
} )

export const updateCategory = asyncHandler( async ( req, res, next ) => {
    const  categoryId  = req.params;


    ///////// check category is exist /////////
    const category = await categoryModel.findById( categoryId )
    if (!category) {
        return next(new ErrorClass('This category not found', StatusCodes.NOT_FOUND))
    }

    ///////// check the name already exist with aother categroy? /////////
    if ( req.body.name ) {
        req.body.name = req.body.name.toLowerCase();
        const nameExist = await categoryModel.findOne( { name: req.body.name, _id: { $ne: categoryId } } );
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
                public_id: category.image.public_id
            }
        )
        req.body.image = {
            secure_url,
            public_id: category.image.public_id
        };

    }

    // 2-update on database 
    const updatedCategory = await categoryModel.findByIdAndUpdate( category._id, req.body, { new: true } )

    return res.status(StatusCodes.ACCEPTED).json( { message: "Done" , result:updatedCategory} );
} )

export const deleteCategory = asyncHandler( async ( req, res, next ) => {
    const {categoryId} = req.params;
    ///////// find and delete from db /////////
    const category = await categoryModel.findByIdAndDelete( categoryId );
    if ( !category ) {
        return next( new ErrorClass( 'Not Found Category', StatusCodes.NOT_FOUND  ) );
    }
    ///////// delete category from cloudinary /////////
    await cloudinary.uploader.destroy( category.image.public_id );


    ///////// delete subCategory for this categroy /////////
    const subcategories = await subCategoryModel.find( { categoryId } )
    // remove from cloudinary
    for (const subCategory of subcategories) {
        await cloudinary.uploader.destroy( subCategory.image.public_id );
    }
    // remove from db
    await subCategoryModel.deleteMany( { categoryId } );


    ///////// delete products for this categroy /////////
    const products = await productModel.find( { categoryId } );
    // remove from cloudinary
    for (const product of products) {
        await cloudinary.uploader.destroy( product.image.public_id );
    }
    // remove from db
    await productModel.deleteMany( { categoryId } );
    
    
    return res.status( StatusCodes.ACCEPTED ).json( { message: "Done", category } );
} )



export const getAllCategories = asyncHandler( async ( req, res, next ) => {
    const mongooseQuery = categoryModel.find().populate( [{
        path:'subcategories'
    }] );
    
    const apiFeature = new ApiFeature(mongooseQuery, req.query );
    apiFeature.pagination().filter().search().sort().select();
    const categories = await apiFeature.mongooseQuery;
    
    return res.json( { message: "Done", categories } );
} )

export const getCategoryById = asyncHandler( async ( req, res, next ) => {
    const categoryId  = req.params;
    const category = await categoryModel.findById( categoryId ).populate( [{
        path:'subcategories'
    }] );
    
    if ( !category ) {
        return next(new ErrorClass('Not Found Category',StatusCodes.NOT_FOUND))
    }
    return res.json( { message: 'Done' , category} );
} )
