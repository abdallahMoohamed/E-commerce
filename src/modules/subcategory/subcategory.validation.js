import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addSubCategory = {
    body: joi.object().required().keys({
        name: generalFields.name,
        categoryId: generalFields.id
    }),
    file: generalFields.file.required(),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({})
}

export const updateSubCategory = {
    body: joi.object().required().keys({
        name: generalFields.name,
    }),
    file: generalFields.file,
    params: joi.object().required().keys( {
        subCategoryId: generalFields.id
    }),
    query: joi.object().required().keys({})
}

export const deleteSubCategory = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys( {
        subCategoryId: generalFields.id
    }),
    query: joi.object().required().keys({})
}

export const getSubCategoryById = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys( {
        subCategoryId: generalFields.id
    }),
    query: joi.object().required().keys({})
}

export const searchSubCategory = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys( {} ),
    query: joi.object().required().keys( {
        searchKey: generalFields.name
    })
}

