import mongoose from 'mongoose'

const connectDB = async () => {
    const userName = encodeURIComponent( process.env.DB_USERNAME )
    const password = encodeURIComponent( process.env.DB_PASSWORD )            
    const connectionString =
        `${ process.env.DB_STRING_CONNECTION_PART1 }${ userName }:${ password }${ process.env.DB_STRING_CONNECTION_PART2 }${ process.env.DB_NAME }`;

    return await mongoose.connect( connectionString ).then( res => {
        console.log( "DB Connected Successfully ....." );
    } ).catch( err => {            
        console.log( `Fail to connectDB ...... ${ err }` );
    } );    

}

export default connectDB;


// const connectDB  = async ()=>{
//     console.log(process.env.DB_LOCAL);
//     return await mongoose.connect(process.env.DB_LOCAL)
//     .then(res=>console.log(`DB Connected successfully on .........`))
//     .catch(err=>console.log(` Fail to connect  DB.........${err} `))
// }