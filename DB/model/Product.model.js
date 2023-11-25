import { model, Schema, Types } from 'mongoose';

const productSchema = new Schema( {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    stock: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    paymentPrice: { type: Number, required: true, default: 1 },
    colors: { type: Array },
    sizes: { type: Array },
    image: { type: Object, required: true },
    coverImages: { type: Array },
    avgRate: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    QRcode: { type: String, required: true },
    
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: Types.ObjectId, ref: 'Subcategory', required: true },
    brandId: { type: Types.ObjectId, ref: 'Brand', required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    wishList: [{ type: Types.ObjectId, ref: 'User'}]

}, {
    timestamps: true
})

const productModel = model('Product', productSchema)

export default productModel