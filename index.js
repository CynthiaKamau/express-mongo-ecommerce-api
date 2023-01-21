const express = require('express');
const dbConnect = require('./config/dbConnect');
const bodyParser = require("body-parser");
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require("morgan")

//Db connection
dbConnect();

app.use(morgan("dev"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser())

app.use('/api/user', authRouter);
app.use('/api/product', productRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
})