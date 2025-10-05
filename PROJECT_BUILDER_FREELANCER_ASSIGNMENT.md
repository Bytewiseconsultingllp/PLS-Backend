# ProjectBuilder Freelancer Assignment Feature

## Overview

The ProjectBuilder system now supports freelancer assignment functionality, similar to the regular Project system. This allows ProjectBuilder projects to be assigned to freelancers for development work.

## New Features

### 1. Database Schema Updates

- Added `interestedFreelancers` and `selectedFreelancers` many-to-many relationships to the `ProjectBuilder` model
- Updated `User` model to include corresponding relations for ProjectBuilder projects
- Created migration: `20251001160455_add_freelancer_assignment_to_project_builder`

### 2. New API Endpoints

#### Get Project with Freelancer Data

```
GET /api/v1/project-builder/:id/freelancers
```

Returns project details including interested and selected freelancers.

#### Add Interested Freelancers

```
POST /api/v1/project-builder/:id/interested-freelancers
```

Body:

```json
{
  "interestedFreelancerIds": ["uid1", "uid2", "uid3"]
}
```

#### Remove Interested Freelancer

```
DELETE /api/v1/project-builder/:id/interested-freelancers
```

Body:

```json
{
  "freelancerUid": "uid1"
}
```

#### Select Freelancers

```
POST /api/v1/project-builder/:id/selected-freelancers
```

Body:

```json
{
  "selectedFreelancerIds": ["uid1", "uid2"]
}
```

#### Remove Selected Freelancer

```
DELETE /api/v1/project-builder/:id/selected-freelancers
```

Body:

```json
{
  "freelancerUid": "uid1"
}
```

### 3. Updated Existing Endpoints

All existing ProjectBuilder endpoints now include freelancer information in their responses:

- `GET /api/v1/project-builder` - List all projects with freelancer data
- `GET /api/v1/project-builder/:id` - Get single project with freelancer data
- `PUT /api/v1/project-builder/:id` - Update project (returns with freelancer data)

### 4. Type Definitions

New TypeScript types have been added:

```typescript
export type TPROJECTBUILDER_FREELANCER_ASSIGNMENT = {
  interestedFreelancerIds?: string[];
  selectedFreelancerIds?: string[];
  freelancerUid?: string;
  freelancerUsername?: string;
};
```

The `TPROJECTBUILDER` type now includes:

```typescript
interestedFreelancers?: Array<{
  uid: string;
  username: string;
  fullName: string;
  email: string;
}>;
selectedFreelancers?: Array<{
  uid: string;
  username: string;
  fullName: string;
  email: string;
}>;
```

## Usage Examples

### 1. Create a ProjectBuilder Project

```javascript
const projectData = {
  projectName: "E-commerce Website",
  projectDescription: "A modern e-commerce platform",
  projectType: "Web Development",
  technologies: ["React", "Node.js", "PostgreSQL"],
  features: ["User Auth", "Product Catalog", "Shopping Cart"],
  budget: 15000,
  timeline: "3 months",
  priority: "HIGH",
  status: "DRAFT",
  clientName: "John Doe",
  clientEmail: "john@example.com",
};

const response = await fetch("/api/v1/project-builder", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_JWT_TOKEN",
  },
  body: JSON.stringify(projectData),
});
```

### 2. Assign Freelancers to Project

```javascript
// Add interested freelancers
await fetch(`/api/v1/project-builder/${projectId}/interested-freelancers`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_JWT_TOKEN",
  },
  body: JSON.stringify({
    interestedFreelancerIds: ["freelancer_uid_1", "freelancer_uid_2"],
  }),
});

// Select freelancers for the project
await fetch(`/api/v1/project-builder/${projectId}/selected-freelancers`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_JWT_TOKEN",
  },
  body: JSON.stringify({
    selectedFreelancerIds: ["freelancer_uid_1"],
  }),
});
```

### 3. Get Project with Freelancer Information

```javascript
const response = await fetch(
  `/api/v1/project-builder/${projectId}/freelancers`,
  {
    headers: {
      Authorization: "Bearer YOUR_JWT_TOKEN",
    },
  },
);

const project = await response.json();
console.log("Interested freelancers:", project.data.interestedFreelancers);
console.log("Selected freelancers:", project.data.selectedFreelancers);
```

## Migration

The database migration has been automatically applied. If you need to run it manually:

```bash
npx prisma migrate dev --name add_freelancer_assignment_to_project_builder
```

## Testing

A test script is provided at `test-project-builder-freelancer-assignment.js` that demonstrates all the new functionality.

To run the test:

```bash
node test-project-builder-freelancer-assignment.js
```

## Key Differences from Regular Projects

1. **Identification**: ProjectBuilder uses `id` (UUID) while regular projects use `projectSlug`
2. **Relations**: Different relation names to avoid conflicts:
   - `InterestedProjectBuilderFreelancers`
   - `SelectedProjectBuilderFreelancers`
3. **Endpoints**: All endpoints use `/project-builder/` prefix instead of `/project/`

## Security

- All endpoints require authentication via JWT token
- Users must have appropriate permissions to assign freelancers
- Soft delete functionality is maintained for all operations

## Error Handling

The API returns appropriate HTTP status codes:

- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found (project or freelancer not found)
- `200` - Success

Error responses include descriptive messages to help with debugging.
