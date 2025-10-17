# Moderator Dashboard - Blog Management API

This document outlines the API endpoints and requirements for the blog management feature in the moderator dashboard.

## Endpoints

### 1. Get All Blogs

- **URL**: `/api/blogs`
- **Method**: GET
- **Headers**:
  - `Authorization`: Bearer <token>
  - `Role`: moderator
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)
  - `search`: string (optional)
- **Response**:
  ```json
  {
    "success": boolean,
    "data": {
      "blogs": [
        {
          "id": string,
          "title": string,
          "content": string,
          "author": string,
          "createdAt": string,
          "updatedAt": string
        }
      ],
      "totalPages": number,
      "currentPage": number
    }
  }

