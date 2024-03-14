import mongoose from 'mongoose';
import { generateSchemaFromSampleDoc, generateSchemaFile } from './utils';
import fs from 'fs';
import path from 'path';

/**
 * Generates TypeScript schema files for Nest.js/Mongoose based on the existing documents in a MongoDB database.
 *
 * @param databaseUri The MongoDB connection URI.
 * @param outputDir The output directory where the schema files will be generated.
 */
export async function generateSchemas(databaseUri: string, outputDir: string) {
  try {
    // Connect to MongoDB
    await mongoose.connect(databaseUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB!');

    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get the database name from the URI
    const databaseName = databaseUri.split('/').pop() || '';

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections({ name: { $regex: /^(?!system\.)/ } }).toArray();

    // Loop through each collection
    for (const collection of collections) {
      const collectionName = collection.name;

      // Create a dummy model for the collection to access its data
      const Model = mongoose.model(collectionName, new mongoose.Schema({}));

      // Get the count of documents in the collection
      const count = await Model.estimatedDocumentCount();

      // Skip empty collections
      if (count === 0) {
        continue;
      }

      // Get a sample document from the collection
      const sampleDoc = await Model.findOne();

      if (sampleDoc) {
        // Generate schema based on the sample document
        const schema = generateSchemaFromSampleDoc(sampleDoc.toObject()); // toObject() to get a plain JavaScript object

        // Generate the schema file
        const schemaFilePath = path.join(outputDir, `${collectionName}.schema.ts`);
        generateSchemaFile(collectionName, schema, schemaFilePath, databaseName);
        console.log(`Generated schema file: ${schemaFilePath}`);
      } else {
        console.log(`Failed to retrieve a sample document from ${collectionName} collection.`);
      }
    }

    // Disconnect from MongoDB
    mongoose.disconnect();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}
