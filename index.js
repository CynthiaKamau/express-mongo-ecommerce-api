const express = require('express');
const dbConnect = require('./config/dbConnect');
const bodyParser = require("body-parser");
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const blogCategoryRouter = require('./routes/blogCategoryRoute');
const productCategoryRouter = require('./routes/productCategoryRoute');
const brandRouter = require('./routes/brandRoute');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require("morgan");

//Db connection
dbConnect();

app.use(morgan("dev"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser())

app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/blog-category', blogCategoryRouter);
app.use('/api/product-category', productCategoryRouter);
app.use('/api/brand', brandRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
})