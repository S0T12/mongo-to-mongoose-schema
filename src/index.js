"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMongooseSchemas = void 0;
const schemaGenerator_1 = require("./schemaGenerator");
/**
 * Generates TypeScript schema files for Nest.js/Mongoose based on the existing documents in a MongoDB database.
 *
 * @param databaseUri The MongoDB connection URI.
 * @param outputDir The output directory where the schema files will be generated.
 */
function generateMongooseSchemas(databaseUri, outputDir) {
    (0, schemaGenerator_1.generateSchemas)(databaseUri, outputDir);
}
exports.generateMongooseSchemas = generateMongooseSchemas;
