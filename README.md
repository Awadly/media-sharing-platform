# Backend Media Management API

This project provides a Node.js backend API for managing media, including uploading, retrieving, updating, deleting, and liking media items. It uses Express.js as the web framework and Knex.js for database queries, with MySQL as the database.

## Installation

### Prerequisites

- **Node.js** (version 14.x or higher)
- **MySQL** (version 5.7 or higher)
- **AWS S3 Account** (for file uploads)

### Steps to Install and Run

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Awadly/media-sharing-platform.git
   cd media-sharing-platform
   ```
2. **Install Dependencies**
   Run the following command to install the required dependencies:
   ```bash
    npm install
   ```
3. **Create a .env File**

   Create a .env file in the root of the project directory to configure your database connection and AWS S3 credentials. Use .env.sample as an Example

4. **Set Up the Database**
   You need to have MySQL running. Make sure your MySQL database is set up and that you have configured it in your .env file. Run the migration to create the necessary tables.
   ```bash
   knex migrate:up
   ```
   This will create a table called media in your MySQL database with the following fields:
   id (auto-increment primary key)
   title (string)
   description (text)
   file_url (string)
   type (enum: "image" or "video")
   likes (integer, default 0)
   created_at (timestamp)
5. **Start the Development Server**
   ```bash
   npm run dev
   ```

## Routes Overview

- **POST /api/media** - Create a new media entry.
- **GET /api/media** - Get all media entries.
- **GET /api/media/:id** - Get media details by ID.
- **PUT /api/media/:id** - Update media by ID.
- **DELETE /api/media/:id** - Delete media by ID.
- **POST /api/media/:id/like** - Like a media item.
- **POST /api/media/:id/unlike** - Unlike a media item.
- **GET /api/media/preSignedURL** - Get a pre-signed URL for uploading files to AWS S3.

## Database Schema

The `media` table has the following columns:

- `id` (Primary key)
- `title` (string)
- `description` (text)
- `file_url` (string)
- `type` (enum: "image", "video")
- `likes` (integer, default: 0)
- `created_at` (timestamp)

## Accessing the Backend

The backend is hosted at [https://awadly.duckdns.org](https://awadly.duckdns.org). All requests to this backend are routed through an Amazon EC2 server.

You can use the API endpoints provided in the Routes Overview section to interact with the media data.
