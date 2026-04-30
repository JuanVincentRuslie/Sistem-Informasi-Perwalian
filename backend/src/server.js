const { app } = require('./app');
const { env } = require('./config/env');
const { checkDatabaseConnection } = require('./db/pool');

async function startServer() {
  try {
    const dbStatus = await checkDatabaseConnection();

    app.listen(env.port, () => {
      process.stdout.write(
        `Backend listening on http://localhost:${env.port}\nDatabase connected at ${dbStatus.now}\n`,
      );
    });
  } catch (error) {
    process.stderr.write(`Failed to start backend: ${error.message}\n`);
    process.exit(1);
  }
}

startServer();
