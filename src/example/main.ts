import 'reflect-metadata';
import { App } from './App';

// Run the application
const app = new App();
app.run().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

