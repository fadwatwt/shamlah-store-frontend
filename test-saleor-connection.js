const { GraphQLClient } = require('graphql-request');

// Use the production Render URL
const endpoint = 'https://shamlh-dashboard.duckdns.org/graphql/';

const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});

const GET_CATEGORIES = `
  query GetCategories {
    categories(level: 0, first: 20) {
      edges {
        node {
          id
          name
          slug
          description
          children(first: 20) {
            edges {
              node {
                id
                name
                slug
              }
            }
          }
        }
      }
    }
  }
`;

async function testConnection() {
  try {
    console.log('Testing connection to Saleor GraphQL API...');
    console.log(`URL: ${endpoint}`);

    const data = await client.request(GET_CATEGORIES);

    console.log('\n✅ Connection successful!');
    console.log('\nCategories found:', data.categories.edges.length);

    data.categories.edges.forEach((edge, index) => {
      const cat = edge.node;
      console.log(`\n${index + 1}. ${cat.name} (${cat.slug})`);
      console.log(`   ID: ${cat.id}`);
      console.log(`   Children: ${cat.children?.edges?.length || 0}`);

      if (cat.children?.edges?.length > 0) {
        cat.children.edges.forEach((child, childIndex) => {
          console.log(`     ${childIndex + 1}. ${child.node.name} (${child.node.slug})`);
        });
      }
    });

  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
  }
}

testConnection();
