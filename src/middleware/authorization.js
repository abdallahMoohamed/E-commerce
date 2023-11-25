import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "../utils/errorClass.js";
import { asyncHandler } from "../utils/errorHandling.js";

export const roles = {
    admin: "Admin"
}
Object.freeze( roles );

const isAuthorized = ( roles = [] ) => {
    return asyncHandler( async ( req, res, next ) => {
        // check user 
        if ( !roles.includes(req.user.role) ) {
            return next( new ErrorClass( 'You are not authorized', StatusCodes.FORBIDDEN ) );
        }
        return next();
    })
}

export default isAuthorized