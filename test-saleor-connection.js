const { GraphQLClient } = require('graphql-request');

// استخدام المتغير من الـ Environment Variables
const endpoint = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/graphql/';

const client = new GraphQLClient(endpoint, {
    headers: {
        'Content-Type': 'application/json',
    },
});
