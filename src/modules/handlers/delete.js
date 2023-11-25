import {
	ReasonPhrases,
	StatusCodes,
} from 'http-status-codes';
import cloudinary from '../../utils/cloudinary.js';
import { ErrorClass } from '../../utils/errorClass.js';
import { asyncHandler } from '../../utils/errorHandling.js';
 
export const deleteOne = ( model ) => {
    
    return asyncHandler( async ( req, res, next ) => {
        const { id } = req.params;
        ///////// find and delete from db /////////
        const result = await model.findByIdAndDelete( id );
        if ( !result ) {
            return next( new ErrorClass( 'Not Found ', StatusCodes.NOT_FOUND ) );
        }
        ///////// delete from cloudinary /////////
        if ( result.image ) {
            await cloudinary.uploader.destroy( result.image.public_id );
        }
        if ( result.coverImages ) {
            for (let i = 0; i < result.coverImages.length; i++) {
                await cloudinary.uploader.destroy( result.coverImages[i].public_id );
            }
        }
    
        return res.status( StatusCodes.ACCEPTED ).json( { message: "Done", result } );
        
    } );

}