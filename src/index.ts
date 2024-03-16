import { generateSchemas } from './schemaGenerator';

/**
 * Generates TypeScript schema files for Nest.js/Mongoose based on the existing documents in a MongoDB database.
 *
 * @param databaseUri The MongoDB connection URI.
 * @param outputDir The output directory where the schema files will be generated.
 */
export async function generateMongooseSchemas(databaseUri: string, outputDir: string): Promise<void> {
  await generateSchemas(databaseUri, outputDir);
}
