import slugify from "slugify";
import categoryModel from "../../../../DB/model/Category.model.js";
import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import {
	ReasonPhrases,
	StatusCodes,
} from 'http-status-codes';
import { ErrorClass } from "../../../utils/errorClass.js";
import { ApiFeature } from "../../../utils/apiFeature.js";


export const addSubCategory = asyncHandler( async ( req, res, next ) => {
    const userId = req.user._id;
    let { name, categoryId } = req.body;
    name = name.toLowerCase();
    const category = await categoryModel.findById( categoryId );
    if ( !category ) {
        return next( new ErrorClass( 'Category Not Found', StatusCodes.NOT_FOUND  ) );
    }
    const subCategoryName = await subCategoryModel.findOne( { name } );
    if ( subCategoryName ) {
        return next( new ErrorClass( 'subCategory already exist' ) );
    }

    // 1- upload image on cloudinary 
    const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: 'E-commerce/subcategory' } );

    // 2- save on data base 
    const subCategory = await subCategoryModel.create( {
        name,
        slug: slugify( name ),
        categoryId,
        image: { secure_url, public_id },
        createdBy: userId
    } )
    
    return res.status( StatusCodes.CREATED ).json( { message: "Done", subCategory } )
} )

export const updateSubCategory = asyncHandler( async ( req, res, next ) => {
    const { subCategoryId } = req.params;


    //////// check the subcategory is exist or not ////////
    const subCategory = await subCategoryModel.findById( subCategoryId );
    if ( !subCategory ) {
        return next( new ErrorClass( 'Not Found This Subcategory!', StatusCodes.NOT_FOUND ) );
    }
    
    //////// check this name already exist or not ////////
    if ( req.body.name ) {
        req.body.name = req.body.name.toLowerCase();
        const nameExist = await subCategoryModel.findOne( { name: req.body.name, _id: { $ne: subCategoryId } } );
        if ( nameExist ) {
            return next( new ErrorClass( 'This Name Is Already Exist' ) );
        }
        req.body.slug = slugify( req.body.name );
    }

    //////// update image if exit ////////
    if ( req.file ) {
        // 1- update on cloudinary 
        const { secure_url } = await cloudinary.uploader.upload(
            req.file.path,
            { public_id: subCategory.image.public_id }
        )

        req.body.image = {
            secure_url,
            public_id : subCategory.image.public_id
        }
    }

    // 2- update on db
    const updatedSubCategory = await subCategoryModel.findByIdAndUpdate( subCategoryId, req.body, { new: true } );

    return res.status( StatusCodes.ACCEPTED ).json( { message: 'Done',result: updatedSubCategory } );
} )

export const deleteSubCategory = asyncHandler( async ( req, res, next ) => {
    const { subCategoryId } = req.params;
    ///// find and delete form db
    const subCategory = await subCategoryModel.findByIdAndDelete( subCategoryId );
    if ( !subCategory ) {
        return next( new ErrorClass( 'Not Found This Subcategory!', StatusCodes.NOT_FOUND ) );
    }

    ///// delete form cloudinary 
    await cloudinary.uploader.destroy( subCategory.image.public_id );

    return res.status( StatusCodes.ACCEPTED ).json( { message: 'Deleted Successfully', subCategory } );
} )

export const getAllSubCategories = asyncHandler( async ( req, res, next ) => {
    const mongooseQuery = subCategoryModel.find().populate( [{
        path:'categoryId'
    }] )

    const apiFeature = new ApiFeature( mongooseQuery, req.query );
    apiFeature.pagination().filter().search().select().sort()
    const subCategories = await apiFeature.mongooseQuery;

    return res.json( { message: 'Done', subCategories } );
} )


export const getById = asyncHandler( async ( req, res, next ) => {
    const { subCategoryId } = req.params;
    const subcategory = await subCategoryModel.findById( subCategoryId );
    if ( !subcategory ) {
        return next( new ErrorClass( 'Not Found This Subcategory', StatusCodes.NOT_FOUND ) );
    }
    return res.json({message:'Done', subcategory})
})