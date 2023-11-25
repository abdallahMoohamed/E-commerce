import { model, Schema, Types } from 'mongoose';


const categorySchema = new Schema( {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: Object },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },  // to display as a json   (in postman)
    toObject: { virtuals: true } // to display as a object (in terminal)
})

categorySchema.virtual( 'subcategories', {
    ref: 'Subcategory',
    localField: '_id',
    foreignField: 'categoryId'
})

const categoryModel = model('Category', categorySchema)

export default categoryModel