import { Schema, model } from "mongoose";


const userSchema = new Schema({

    userName: {
        type: String,
        required: [true, 'userName is required'],
        min: [2, 'minimum length 2 char'],
        max: [20, 'max length 20 char']

    },
    email: {
        type: String,
        unique: [true, 'email must be unique value'],
        required: [true, 'userName is required'],
    },
    password: {
        type: String,
        required: [true, 'password is required'],
    },
    phone: {
        type: String,
        required: [true, 'phone is required']
    },
    role: {
        type: String,
        default: 'User',
        enum: ['User', 'Admin']
    },

    status: {
        type: Boolean,
        default: false,
    },
    confirmEmail: {
        type: Boolean,
        default: false,
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    image: {type:Object},
    DOB: Date,
    codeNumber: {
        type: String,
        min: [6, 'code length must be 6'],
        max: [6, 'code length must be 6']        
    } 
}, {
    timestamps: true
})


const userModel = model('User', userSchema)
export default userModel