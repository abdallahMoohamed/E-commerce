import { nanoid } from "nanoid";
import userModel from "../../../../DB/model/User.model.js";
import { generateCode, generateToken } from "../../../utils/GenerateAndVerifyToken.js";
import cloudinary from "../../../utils/cloudinary.js";
import sendEmail from "../../../utils/email.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import bcrypt from 'bcryptjs'
import Crypto from "crypto-js";
import cartModel from "../../../../DB/model/Cart.model.js";
import {
	ReasonPhrases,
	StatusCodes,
} from 'http-status-codes';

export const signUp = asyncHandler( async ( req, res, next ) => {
    const { userName, email, password, phone, DOB } = req.body;
    console.log({ userName, email, password, phone, DOB });
    //check user is exist 
    const userExist = await userModel.findOne( { email } );
    if ( userExist ) {
        return next(new ErrorClass(`this email ${email} is exist`,StatusCodes.CONFLICT))
    }

    // hash  password 
    const hashPassword = bcrypt.hashSync( password, parseInt( process.env.SALT_ROUND ) );
    // encrypt phone 
    const encryptPhone = Crypto.AES.encrypt( phone, process.env.ENCRYPTION_KEY ).toString();
    // upload image on cloudinary 
    const { secure_url, public_id } = await cloudinary.uploader.upload( req.file.path, { folder: 'E-commerce/user/images' } );
    
    // to generate the code and send email
    const codeNumber = generateCode();
    sendEmail( { to: email,subject:'confirm email', text: `Code : ${ codeNumber }` } );

    // save user on data base
    const user = await userModel.create( {
        userName,
        email,
        password:hashPassword,
        phone:encryptPhone,
        DOB,
        image: { secure_url, public_id },
        codeNumber
    })

    // to create empty cart to this user
    await cartModel.create( { userId: user._id } );

    return res.json( { message: 'Done', user } );
} )

export const confirmEmail = asyncHandler( async ( req, res, next ) => {
    const { email, codeNumber } = req.body;
    
    const user = await userModel.findOneAndUpdate( { email, codeNumber }, { codeNumber: nanoid( 6 ), confirmEmail: true } );
    if ( !user ) {
        return next( new ErrorClass( 'In-valid code or email' ) );
    }

    return res.json( { message: 'Done' } );
} )


export const signIn = asyncHandler( async ( req, res, next ) => {
    const { email, password } = req.body;
    // check email
    const user = await userModel.findOne( { email } );
    if ( !user ) {
        return next( new ErrorClass( 'In-valid information ', StatusCodes.BAD_REQUEST ) );
    }
    // check password 
    const match = bcrypt.compareSync( password, user.password );
    if ( !match ) {
        return next( new ErrorClass( 'In-valid information ', StatusCodes.BAD_REQUEST ) );
    }

    // generate token
    const token = generateToken( {
        payload: {
            id: user._id,
            email
        }
    } )
    ///////////////// Check The Confirm Email /////////////////
    if ( !user.confirmEmail ) {
        return next( new ErrorClass( 'You must confirm email' ) );
    }
    
    return res.json( { message: 'done', token } );
} )

export const sendCode = asyncHandler( async ( req, res, next ) => {
    const { email } = req.body;

    // check email
    const user = await userModel.findOne( { email } );
    if ( !user ) {
        return next( new ErrorClass( 'In-valid information ', StatusCodes.BAD_REQUEST ) );
    }

    // to generate the code and send email
    const codeNumber = generateCode();
    sendEmail( { to: email,subject:'forget password', text: `Code : ${ codeNumber }` } );
    
    user.codeNumber = codeNumber;
    await user.save();
    console.log({user});
    return res.json({message:'Done, check your inbox'})
} )

export const resetPassword = asyncHandler( async ( req, res, next ) => {
    const { email, codeNumber, newPassword } = req.body;

    const user = await userModel.findOneAndUpdate(
        { email, codeNumber },
        {
            codeNumber: nanoid( 6 ),
            password: bcrypt.hashSync( newPassword, parseInt(process.env.SALT_ROUND) )
        }
    );

    if ( !user ) {
        return next( new ErrorClass( 'In-valid code or email' ) );
    }

    return res.json( { message: 'Done' } );
    
})