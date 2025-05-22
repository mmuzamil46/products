import express from 'express'
import mysql from 'mysql2/promise'
import path from 'path'
import cors from 'cors'
import multer from 'multer'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()
app.use(express.json())

app.use(cors())



const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password:'vertrigo',
  database:'productsdb'
});

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/connect', async (req, res) =>{
  try {
    const connection = await pool.getConnection()
    console.log('Connected');
    connection.release()
    res.send('Connected successfully')
  } catch (error) {
    console.error('Error connecting to the database:', error);
    res.status(500).send('Failed to connect to the database.');
  }
  

})

app.get('/create-database/:databaseName', async (req,res) =>{
  const databaseName = req.params.databaseName
  try {
    const con = await pool.getConnection();
    await con.execute(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
    console.log(`${databaseName} database created or already exists`);
    con.release();
    res.send(`${databaseName} database created or already exists`)
  } catch (error) {
    console.log('Error',error)
    res.status(500).send(`Failed to create ${databaseName} database`)
  }
})
//create products table
const productsTableQuery = `
CREATE TABLE IF NOT EXISTS products (
  product_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  main_image_url VARCHAR(255) NOT NULL
)
`;

app.get('/create-products-table', async (req,res) => {
  try {
    const con = await pool.getConnection();
    await con.execute(productsTableQuery);
    console.log('products table created successfully or already exists')
    con.release();
    res.send('products table created successfully or already exists')
  } catch (error) {
    console.log('Error:',error)
    res.status(500).send('Failed to create products')
  }
})

//create description table

const productDescriptionTableQuery = `
CREATE TABLE IF NOT EXISTS product_description (
  description_id INT PRIMARY KEY,
  product_id INT NOT NULL,
  feature VARCHAR(255) NOT NULL,
  price VARCHAR(255) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
)
`;

app.get('/create-product-description-table', async (req,res) => {
  try {
    const con = await pool.getConnection();
    await con.execute(productDescriptionTableQuery);
    console.log('product description table created successfully or already exists')
    con.release();
    res.send('product description table created successfully or already exists')
  } catch (error) {
    console.log('Error:',error)
    res.status(500).send('Failed to create product description table')
  }
})

//create brief description table

const briefDescriptionTableQuery = `
CREATE TABLE IF NOT EXISTS brief_description (
  brief_description_id INT PRIMARY KEY,
  product_id INT NOT NULL,
  brief_description_title TEXT NOT NULL,
  brief_description TEXT NOT NULL,
  sub_brief_description_one TEXT NOT NULL,
  sub_brief_description_two TEXT NOT NULL,
  desc_main_image VARCHAR(255) NOT NULL,
  desc_sub_image_one VARCHAR(255) NOT NULL,
  desc_sub_image_two VARCHAR(255) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
)
`;
app.get('/create-brief-description-table', async (req,res) => {
  try {
    const con = await pool.getConnection();
    await con.execute(briefDescriptionTableQuery);
    console.log('brief description table created successfully or already exists')
    con.release();
    res.send('brief description table created successfully or already exists')
  } catch (error) {
    console.log('Error:',error)
    res.status(500).send('Failed to create brief description table')
  }
})




//INSERTION

app.post('/product', upload.single('main_image'), async (req, res) => {
  const {product_id,name} = req.body;
  const main_image_url = req.file ? `/uploads/${req.file.filename}` : null;
  if(!product_id || !name || !main_image_url){
    return res.status(400).send('product id, name and main image are required');
  }
  try {
    const con = await pool.getConnection()
    const [result] = await con.execute('INSERT INTO products (product_id, name, main_image_url) VALUES (?, ?, ?)',[product_id, name, main_image_url]);
    con.release();
    console.log('Product inserted',result.affectedRows);
    res.send('Product Inserted')
  } catch (error) {
    console.error('Error inserting product:', error);
    res.status(500).send('Failed to insert product');
  }
})

app.post('/product-description', async (req, res) => {
  const { description_id, product_id, feature, price } = req.body;

  if (!description_id || !product_id || !feature || !price) {
    return res.status(400).send('Description ID, product ID, feature, and price are required.');
  }

  try {
    const con = await pool.getConnection();
    const [result] = await con.execute(
      'INSERT INTO product_description (description_id, product_id, feature, price) VALUES (?, ?, ?, ?)',
      [description_id, product_id, feature, price]
    );
    con.release();
    console.log('Product description inserted successfully:', result);
    res.status(201).send('Product description inserted successfully');
  } catch (error) {
    console.error('Error inserting product description:', error);
    res.status(500).send('Failed to insert product description');
  }
});

app.post('/brief-description',upload.fields([
  {name:'desc_main_image',maxCount:1},
  {name:'desc_sub_image_one',maxCount:1},
  {name:'desc_sub_image_two',maxCount:1}
]), async (req,res) => {
const {
      brief_description_id,
      product_id,
      brief_description_title,
      brief_description,
      sub_brief_description_one,
      sub_brief_description_two,
    } = req.body;

     const desc_main_image = req.files['desc_main_image'] ? `/uploads/${req.files['desc_main_image'][0].filename}` : null;
    const desc_sub_image_one = req.files['desc_sub_image_one'] ? `/uploads/${req.files['desc_sub_image_one'][0].filename}` : null;
    const desc_sub_image_two = req.files['desc_sub_image_two'] ? `/uploads/${req.files['desc_sub_image_two'][0].filename}` : null;

     if (
      !brief_description_id ||
      !product_id ||
      !brief_description_title ||
      !brief_description ||
      !sub_brief_description_one ||
      !sub_brief_description_two ||
      !desc_main_image ||
      !desc_sub_image_one ||
      !desc_sub_image_two
    ) {
      return res.status(400).send('All brief description fields and images are required.');
    }

    try {
      const con = await pool.getConnection();
      const [result] = await con.execute(
        `
        INSERT INTO brief_description (
          brief_description_id,
          product_id,
          brief_description_title,
          brief_description,
          sub_brief_description_one,
          sub_brief_description_two,
          desc_main_image,
          desc_sub_image_one,
          desc_sub_image_two
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          brief_description_id,
          product_id,
          brief_description_title,
          brief_description,
          sub_brief_description_one,
          sub_brief_description_two,
          desc_main_image,
          desc_sub_image_one,
          desc_sub_image_two,
        ]
      );
      con.release();
      console.log('Brief description inserted successfully:', result);
      res.status(201).send('Brief description inserted successfully');
    } catch (error) {
      console.error('Error inserting brief description:', error);
      res.status(500).send('Failed to insert brief description');
    }
})

//RETRIEVING ALL PRODUCTS

app.get('/products-details', async (req, res) => {
  try {
    const con = await pool.getConnection();
    const [productsWithDetails] = await con.execute(
      `
      SELECT
        p.product_id,
        p.name AS product_name,
        p.main_image_url,
        pd.description_id,
        pd.feature,
        pd.price,
        bd.brief_description_id,
        bd.brief_description_title,
        bd.brief_description,
        bd.sub_brief_description_one,
        bd.sub_brief_description_two,
        bd.desc_main_image AS brief_desc_main_image,
        bd.desc_sub_image_one AS brief_desc_sub_image_one,
        bd.desc_sub_image_two AS brief_desc_sub_image_two
      FROM
        products p
      LEFT JOIN
        product_description pd ON p.product_id = pd.product_id
      LEFT JOIN
        brief_description bd ON p.product_id = bd.product_id
      `
    );
    con.release();
    res.json(productsWithDetails);
  } catch (error) {
    console.error('Error retrieving all products with details:', error);
    res.status(500).send('Failed to retrieve products with details');
  }
});

//RETRIEVING SINGLE PRODUCT

app.get('/product-details/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const con = await pool.getConnection();
    const [product] = await con.execute(
      `
      SELECT
        p.product_id,
        p.name AS product_name,
        p.main_image_url,
        pd.description_id,
        pd.feature,
        pd.price,
        bd.brief_description_id,
        bd.brief_description_title,
        bd.brief_description,
        bd.sub_brief_description_one,
        bd.sub_brief_description_two,
        bd.desc_main_image AS brief_desc_main_image,
        bd.desc_sub_image_one AS brief_desc_sub_image_one,
        bd.desc_sub_image_two AS brief_desc_sub_image_two
      FROM
        products p
      LEFT JOIN
        product_description pd ON p.product_id = pd.product_id
      LEFT JOIN
        brief_description bd ON p.product_id = bd.product_id
      WHERE
        p.product_id = ?
      `,
      [productId]
    );
    con.release();

    if (product.length > 0) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    console.error('Error retrieving product details:', error);
    res.status(500).send('Failed to retrieve product details');
  }
});



app.listen(5000,() => console.log('The server is running on 5000'))





