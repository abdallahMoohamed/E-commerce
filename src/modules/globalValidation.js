import joi from 'joi'
import { generalFields } from '../middleware/validation.js'

export const idValid = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys( {
        id: generalFields.id
    }),
    query: joi.object().required().keys({})
}

