"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSchemaFile = exports.generateSchemaFromSampleDoc = void 0;
const mongoose_1 = require("mongoose");
const fs_1 = __importDefault(require("fs"));
const MAX_DEPTH = 5; // Adjust this value as needed
/**
 * Generates a Mongoose schema definition from a sample document.
 *
 * @param doc The sample document from which the schema will be inferred.
 * @param depth The current depth of recursion (used for handling nested objects and arrays).
 * @param visited A list of visited objects to avoid circular references.
 * @returns The inferred schema definition.
 */
function generateSchemaFromSampleDoc(doc, depth = 0, visited = []) {
    // Handle Mongoose document objects
    if (doc && doc._doc) {
        doc = doc._doc;
    }
    const schema = {};
    // Check if the depth limit is reached or if the object has been visited before
    if (depth > MAX_DEPTH || visited.includes(doc)) {
        return { type: mongoose_1.Schema.Types.Mixed };
    }
    visited.push(doc); // Add the current object to the visited list
    if (Array.isArray(doc)) {
        // Handle arrays
        const arrayType = generateSchemaFromSampleDoc(doc[0], depth + 1, visited);
        return [arrayType];
    }
    else if (typeof doc === 'object' && doc !== null) {
        // Handle objects
        for (const key in doc) {
            const value = doc[key];
            schema[key] = generateSchemaFromSampleDoc(value, depth + 1, visited);
        }
    }
    else {
        // Handle primitive types
        switch (typeof doc) {
            case 'string':
                return { type: String };
            case 'number':
                return { type: Number };
            case 'boolean':
                return { type: Boolean };
            case 'object':
                if (doc === null) {
                    return { type: mongoose_1.Schema.Types.Mixed, required: false };
                }
                else if (doc instanceof Date) {
                    return { type: Date };
                }
                else if (typeof doc === 'object' && doc._bsontype === 'ObjectID') {
                    return { type: mongoose_1.Schema.Types.ObjectId };
                }
                else {
                    // Unsupported data type
                    return { type: mongoose_1.Schema.Types.Mixed };
                }
            default:
                // Unsupported data type
                return { type: mongoose_1.Schema.Types.Mixed };
        }
    }
    return schema;
}
exports.generateSchemaFromSampleDoc = generateSchemaFromSampleDoc;
/**
 * Generates a TypeScript schema file for a Nest.js/Mongoose model.
 *
 * @param collectionName The name of the collection/model.
 * @param schema The inferred schema definition.
 * @param filePath The output file path for the generated schema file.
 * @param databaseName The name of the database.
 */
function generateSchemaFile(collectionName, schema, filePath, databaseName) {
    const fileContent = `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: '${collectionName}' })
export class ${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} {
${Object.entries(schema)
        .map(([key]) => `  @Prop()
  ${key}: any;`)
        .join('\n\n')}
}

export const ${collectionName}Schema = SchemaFactory.createForClass(${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)});
`;
    fs_1.default.writeFileSync(filePath, fileContent, 'utf-8');
}
exports.generateSchemaFile = generateSchemaFile;
