import path from 'path';
import { fileURLToPath } from 'url';

// Resolve `__dirname` for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './src/index.js', // Your app's entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', // Bundled output file
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Match .js and .jsx files
        exclude: /node_modules/, // Exclude dependencies
        use: {
          loader: 'babel-loader', // Use Babel loader
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Automatically resolve these extensions
  },
  mode: 'development', // Set mode to development
};
