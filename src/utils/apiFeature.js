export class ApiFeature {
    constructor( mongooseQuery, queryData ) {
        this.mongooseQuery = mongooseQuery;
        this.queryData = queryData
    }

    pagination = () => {
        let size = this.queryData.size;
        let page = this.queryData.page;
        if ( page <= 0 || !page ) page = 1;
        if ( size <= 0 || !size ) size = 5;
        const skip = size * ( page - 1 );    
        this.mongooseQuery.skip( skip ).limit( size )
        return this
    }

    filter = () => {
        // Delete any think can failer the query is that will be send to db
        let reqQuery = {...this.queryData}
        const excluded = ['sort', 'page', 'size', 'fields', 'searchKey'];
        excluded.forEach(element => {
            delete reqQuery[element];
        });

        // add "&" to query
        reqQuery = JSON.stringify( reqQuery ).replace( /lte|lt|gte|gt/g, ( match ) => {
            return `$${match}`
        })
        reqQuery = JSON.parse( reqQuery );
        this.mongooseQuery.find( reqQuery );
        return this
    }

    sort = () => {
        if ( this.queryData.sort ) {
            this.mongooseQuery.sort( this.queryData.sort.replace( /,/g, ' ' ) );
        }
        return this
    }

    search = () => {
        if ( this.queryData.searchKey ) {
            this.mongooseQuery.find( {
                $or: [
                    { name: { $regex: `${this.queryData.searchKey}` } }
                    // { description: { $regex: `${this.queryData.searchKey}` } }
                ]
            } )
        }
        return this
    }

    select = () => {
        if ( this.queryData.fields ) {
            this.mongooseQuery.select( this.queryData.fields.replace( /,/g, ' ' ) );
        }
        return this
    }

    
    getPage = () => {
        return +this.queryData.page;
    }
    totalPages = (nubmerOfDocuments) => {
        const totalPages = Math.ceil( nubmerOfDocuments / this.queryData.size  );
        return totalPages;
    }

}