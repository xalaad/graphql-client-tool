# GraphQL Client

A flexible GraphQL client that supports both synchronous and asynchronous operations, JSON queries, and file uploads.

## Installation

```bash
npm install graphql-client-tool
```

## Usage

### Initialize the Client

```javascript
const client = new GraphQLClient('/graphql', {
  headers: {
    'Authorization': 'Bearer your-token'
  },
  credentials: 'include'
});
```

### Asynchronous Queries

```javascript
// Using async/await
async function fetchUser(id) {
  const query = `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
      }
    }
  `;

  const variables = { id };
  
  const response = await client.query(query, variables);
  
  if (response.error) {
    console.error('Error:', response.error);
    return;
  }
  
  console.log('User data:', response.data);
}

// Using promises
client.query(query, variables)
  .then(response => {
    console.log('User data:', response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Synchronous Queries

```javascript
function fetchUserSync(id) {
  const query = `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
      }
    }
  `;

  const variables = { id };
  
  const response = client.syncQuery(query, variables);
  
  if (response.error) {
    console.error('Error:', response.error);
    return;
  }
  
  console.log('User data:', response.data);
  return response.data;
}
```

### Asynchronous Mutations

```javascript
async function updateUser(id, userData) {
  const mutation = `
    mutation UpdateUser($id: ID!, $data: UserInput!) {
      updateUser(id: $id, data: $data) {
        id
        name
        email
      }
    }
  `;

  const variables = {
    id,
    data: userData
  };
  
  const response = await client.mutation(mutation, variables);
  
  if (response.error) {
    console.error('Error:', response.error);
    return;
  }
  
  console.log('Updated user:', response.data);
}
```

### Synchronous Mutations

```javascript
function updateUserSync(id, userData) {
  const mutation = `
    mutation UpdateUser($id: ID!, $data: UserInput!) {
      updateUser(id: $id, data: $data) {
        id
        name
        email
      }
    }
  `;

  const variables = {
    id,
    data: userData
  };
  
  const response = client.syncMutation(mutation, variables);
  
  if (response.error) {
    console.error('Error:', response.error);
    return;
  }
  
  console.log('Updated user:', response.data);
  return response.data;
}
```

### File Uploads

```javascript
async function uploadAvatar(userId, file) {
  const mutation = `
    mutation UploadAvatar($userId: ID!, $file: Upload!) {
      uploadAvatar(userId: $userId, file: $file) {
        success
        url
      }
    }
  `;

  const variables = {
    userId,
    file
  };
  
  const response = await client.mutation(mutation, variables);
  
  if (response.error) {
    console.error('Error:', response.error);
    return;
  }
  
  console.log('Upload result:', response.data);
}
```

## Configuration Options

```javascript
const options = {
  // Custom headers
  headers: {
    'Authorization': 'Bearer token',
    'Custom-Header': 'value'
  },
  
  // Credentials mode ('include', 'same-origin', 'omit')
  credentials: 'include',
  
  // Custom fetch function
  fetchFn: customFetch,
  
  // Request/Response interceptors
  interceptors: {
    request: (config) => {
      // Modify request config
      return config;
    },
    response: (data) => {
      // Transform response data
      return data;
    }
  }
};

const client = new GraphQLClient('https://api.example.com/graphql', options);
```

## Response Format

All methods return responses in the following format:

```javascript
{
  data: any | null,    // The query/mutation result
  loading: boolean,    // Always false in sync methods
  error: string | null // Error message if something went wrong
}
```

## Important Notes

1. Synchronous methods (`syncQuery` and `syncMutation`) use `XMLHttpRequest` under the hood and will block the main thread until the request completes. Use with caution!
2. File uploads are only supported in asynchronous methods.
3. Synchronous methods may not be supported in all environments (e.g., Node.js).
4. It's recommended to use async methods when possible for better performance and user experience.