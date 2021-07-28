const mongoose = require('mongoose')
const ENV = process.env.ENV

let mongoURI = ENV === 'PROD' ? process.env.MONGO_URI : process.env.DEV_MONGO_URI

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log(`${ENV} database connected!`))
