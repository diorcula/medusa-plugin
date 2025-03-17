#!/bin/sh

# Create an admin user, note that the 'medusa-plugin-medusa-1' is the container name and might vary
docker exec -it medusa-plugin-medusa-1 npx medusa user -e admin-5@medusa-test.com -p supersecret

# Log in with the created user to get a token
TOKEN=$(curl -s -X POST 'http://localhost:9000/auth/user/emailpass' \
          -H 'Content-Type: application/json' \
          --data-raw '{
          "email": "admin-5@medusa-test.com",
          "password": "supersecret"
      }' | jq -r '.token')

# echo token
echo "token is: $TOKEN"

sleep 5

# List current API keys
CURRENT_API_KEYS=$(curl -s -X GET 'http://localhost:9000/admin/api-keys' \
        -H "Authorization: Bearer $TOKEN" \
        -H 'Content-Type: application/json')

# Print the current API keys
echo "Current API Keys: $CURRENT_API_KEYS"

# Generate an API key using the token
API_KEY_RESPONSE=$(curl -s -X POST 'http://localhost:9000/admin/api-keys' \
        -H "Authorization: Bearer $TOKEN" \
        -H 'Content-Type: application/json' \
        --data-raw '{
        "title": "Admin Key",
        "type": "secret"
    }')

# Print the full JSON response
echo "API Key Response: $API_KEY_RESPONSE"

# Extract the API key token from the JSON response
GENERATED_API_KEY=$(echo $API_KEY_RESPONSE | jq -r '.api_key.token')

# Save the API key in the .env file
# echo "ADMIN_API_KEY=$GENERATED_API_KEY" >> /app/.env 
# echo "ADMIN_API_KEY=$GENERATED_API_KEY" >> ./dev/.env   # for local development 
echo "generated admin api key: $GENERATED_API_KEY"
# echo "Admin API Key generated and saved in .env file"