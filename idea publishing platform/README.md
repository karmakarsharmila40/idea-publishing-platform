# Idea Publishing Platform

A web application that allows users to publish their ideas, attach files, and interact with other users' ideas through comments and votes.

## Features

- User authentication (register, login, profile management)
- Publish ideas with title, description, and category
- Attach files to your ideas (stored in cloud storage)
- Comment on ideas
- Vote on ideas (upvote/downvote)
- Search and filter ideas by category, popularity, and keywords
- Responsive design for mobile and desktop

## Technical Details

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express.js
- Database: MongoDB
- File Storage: AWS S3
- Authentication: JWT (JSON Web Tokens)

## How to Use

### Prerequisites

- Node.js and npm installed
- MongoDB installed locally or a MongoDB Atlas account
- AWS account with S3 bucket configured

### Setup

1. Clone the repository
2. Install backend dependencies:
   ```
   cd server
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the server directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     AWS_ACCESS_KEY_ID=your_aws_access_key
     AWS_SECRET_ACCESS_KEY=your_aws_secret_key
     AWS_REGION=your_aws_region
     S3_BUCKET=your_s3_bucket_name
     ```

### Running the Application

1. Start the backend server:
   ```
   cd server
   npm start
   ```
2. Open `index.html` in your web browser or serve the frontend files using a static file server

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get current user profile

### Ideas
- `GET /api/ideas` - Get all ideas (with pagination and filtering)
- `GET /api/ideas/:id` - Get a specific idea
- `POST /api/ideas` - Create a new idea
- `PUT /api/ideas/:id` - Update an idea
- `DELETE /api/ideas/:id` - Delete an idea
- `POST /api/ideas/:id/vote` - Vote on an idea

### Comments
- `POST /api/comments/:ideaId` - Add a comment to an idea
- `DELETE /api/comments/:ideaId/:commentId` - Delete a comment

### Files
- `POST /api/files/:ideaId` - Upload a file attachment
- `DELETE /api/files/:ideaId/:fileId` - Delete a file attachment

## Future Improvements

- Add user profile pages
- Implement social sharing features
- Add notifications system
- Implement real-time updates with WebSockets
- Add admin dashboard for content moderation
- Implement analytics for ideas and user engagement