import { model, Schema, Types } from 'mongoose';


const subCategorySchema = new Schema({
    name: { type: String, required: true, unique:true },
    slug: { type: String, required: true, unique:true },
    image: { type: Object },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
}, {
    timestamps: true
})

const subCategoryModel = model('Subcategory', subCategorySchema)

export default subCategoryModel