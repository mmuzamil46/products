# Product Management Backend API

This project provides a robust backend API for managing product information, including product details, descriptions, and brief descriptions. It uses **Express.js** for the server, **MySQL2** for database interaction, and **Multer** for handling file uploads.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [File Uploads](#file-uploads)
- [Running the Application](#running-the-application)

---

## Features

* **Database Connection:** Establishes a connection to a MySQL database using a connection pool.
* **Dynamic Database Creation:** Allows creation of new databases via an API endpoint.
* **Table Creation:** Endpoints to create `products`, `product_description`, and `brief_description` tables.
* **Product Management:**
    * Add new products with a main image.
    * Add detailed descriptions for products.
    * Add brief descriptions with multiple images for products.
* **Product Retrieval:**
    * Retrieve all products with their associated descriptions and brief descriptions.
    * Retrieve a single product's details by its ID.
* **Image Uploads:** Handles storage of product images and description images.
* **CORS Enabled:** Configured to allow cross-origin requests.

---

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install express mysql2 multer path cors
    ```

---

## Configuration

Before running the application, you need to configure your MySQL database connection.

1.  Open the `server.js` (or your main application file) file.
2.  Locate the `pool` configuration:

    ```javascript
    const pool = mysql.createPool({
      host: '',
      user: '',
      password:'',
      database:''
    });
    ```

3.  Replace the empty strings with your actual MySQL database credentials:

    * `host`: Your MySQL host (e.g., `'localhost'`)
    * `user`: Your MySQL username (e.g., `'root'`)
    * `password`: Your MySQL password
    * `database`: (Optional) The name of the database you want to connect to initially. If left empty, you can create it via the `/create-database` endpoint.

---

## Database Setup

This API provides endpoints to set up your database structure. You can call these endpoints sequentially after configuring your database connection.

1.  **Connect to the database:**
    `GET /connect`
    This endpoint verifies the database connection.

2.  **Create a database (optional, if you haven't specified one in the config):**
    `GET /create-database/:databaseName`
    Replace `:databaseName` with your desired database name (e.g., `/create-database/product_db`).

3.  **Create the `products` table:**
    `GET /create-products-table`

4.  **Create the `product_description` table:**
    `GET /create-product-description-table`

5.  **Create the `brief_description` table:**
    `GET /create-brief-description-table`

---

## API Endpoints

### Database & Table Management

* **GET `/connect`**
    * Checks the database connection.
    * Response: `Connected successfully` or `Failed to connect to the database.`

* **GET `/create-database/:databaseName`**
    * Creates a new database with the specified name.
    * `databaseName`: The name of the database to create.
    * Response: `${databaseName} database created or already exists` or error message.

* **GET `/create-products-table`**
    * Creates the `products` table if it doesn't exist.
    * Response: `products table created successfully or already exists` or error message.

* **GET `/create-product-description-table`**
    * Creates the `product_description` table if it doesn't exist.
    * Response: `product description table created successfully or already exists` or error message.

* **GET `/create-brief-description-table`**
    * Creates the `brief_description` table if it doesn't exist.
    * Response: `brief description table created successfully or already exists` or error message.

### Product Data Insertion

* **POST `/product`**
    * Adds a new product to the `products` table.
    * **Requires `Content-Type: multipart/form-data` for file upload.**
    * **Form Fields:**
        * `product_id` (INT): Unique ID for the product.
        * `name` (VARCHAR): Name of the product.
        * `main_image` (File): The main image for the product.
    * Response: `Product Inserted` or error message.

* **POST `/product-description`**
    * Adds a detailed description for a product to the `product_description` table.
    * **Body (JSON):**
        ```json
        {
            "description_id": 1,
            "product_id": 101,
            "feature": "High-quality material",
            "price": "$99.99"
        }
        ```
    * Response: `Product description inserted successfully` or error message.

* **POST `/brief-description`**
    * Adds a brief description and associated images for a product to the `brief_description` table.
    * **Requires `Content-Type: multipart/form-data` for file uploads.**
    * **Form Fields:**
        * `brief_description_id` (INT): Unique ID for the brief description.
        * `product_id` (INT): The ID of the product this description belongs to.
        * `brief_description_title` (TEXT): Title for the brief description.
        * `brief_description` (TEXT): Main text of the brief description.
        * `sub_brief_description_one` (TEXT): First sub-description.
        * `sub_brief_description_two` (TEXT): Second sub-description.
        * `desc_main_image` (File): Main image for the brief description.
        * `desc_sub_image_one` (File): First sub-image for the brief description.
        * `desc_sub_image_two` (File): Second sub-image for the brief description.
    * Response: `Brief description inserted successfully` or error message.

### Product Data Retrieval

* **GET `/products-details`**
    * Retrieves all products with their associated `product_description` and `brief_description` details.
    * Response: JSON array of products with joined details.

* **GET `/product-details/:productId`**
    * Retrieves a single product's details by its `product_id`.
    * `productId`: The ID of the product to retrieve.
    * Response: JSON array containing the product details (or empty if not found) or `Product not found` status 404.

---

## File Uploads

Images are uploaded to the `uploads/` directory in the root of the project. The server exposes these files statically via the `/uploads` route. For example, if an image is uploaded as `my-image.jpg`, it will be accessible at `http://localhost:5000/uploads/my-image.jpg`.

---


