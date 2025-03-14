# Medusa Plugin

## Setup

### Using Docker

1. **Clone the repository:**

   ```bash
   git clone https://github.com/diorcula/medusa-plugin.git
   cd medusa-plugin
   ```

2. **Build and run using Docker Compose:**

   ```bash
   docker-compose up -d
   ```

3. **Set up the database and run migrations:**

   ```bash
   docker-compose exec medusa medusa migrations run
   ```

4. **Create a test admin user:**

   ```bash
   docker-compose exec medusa node create-admin-user.js
   ```

5. **Run tests:**
   ```bash
   docker-compose exec medusa npm test
   ```

### Without Docker

If you prefer not to use Docker, you can set up the environment manually by following these steps:

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up the database:**

   ```bash
   # For PostgreSQL
   docker run --name medusa-db -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres
   ```

3. **Create a `.env` file:**

   ```ini
   DATABASE_URL=postgres://postgres:password@localhost:5432/medusa
   ```

4. **Run migrations:**

   ```bash
   medusa migrations run
   ```

5. **Create a test admin user:**

   ```bash
   node create-admin-user.js
   ```

6. **Run tests:**
   ```bash
   npm test
   ```

## Publishing the Plugin

When publishing the plugin, you do not need to include the Docker configuration files in the package. Just ensure they are available in the repository, and provide clear instructions in the README.
