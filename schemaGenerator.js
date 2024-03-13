"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSchemas = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("./utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Generates TypeScript schema files for Nest.js/Mongoose based on the existing documents in a MongoDB database.
 *
 * @param databaseUri The MongoDB connection URI.
 * @param outputDir The output directory where the schema files will be generated.
 */
function generateSchemas(databaseUri, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(databaseUri, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log('Connected to MongoDB!');
            // Create the output directory if it doesn't exist
            if (!fs_1.default.existsSync(outputDir)) {
                fs_1.default.mkdirSync(outputDir, { recursive: true });
            }
            // Get the database name from the URI
            const databaseName = databaseUri.split('/').pop() || '';
            // Get all collection names
            const collections = yield mongoose_1.default.connection.db.listCollections({ name: { $regex: /^(?!system\.)/ } }).toArray();
            // Loop through each collection
            for (const collection of collections) {
                const collectionName = collection.name;
                // Create a dummy model for the collection to access its data
                const Model = mongoose_1.default.model(collectionName, new mongoose_1.default.Schema({}));
                // Get the count of documents in the collection
                const count = yield Model.estimatedDocumentCount();
                // Skip empty collections
                if (count === 0) {
                    continue;
                }
                // Get a sample document from the collection
                const sampleDoc = yield Model.findOne();
                if (sampleDoc) {
                    // Generate schema based on the sample document
                    const schema = (0, utils_1.generateSchemaFromSampleDoc)(sampleDoc.toObject()); // toObject() to get a plain JavaScript object
                    // Generate the schema file
                    const schemaFilePath = path_1.default.join(outputDir, `${collectionName}.schema.ts`);
                    (0, utils_1.generateSchemaFile)(collectionName, schema, schemaFilePath, databaseName);
                    console.log(`Generated schema file: ${schemaFilePath}`);
                }
                else {
                    console.log(`Failed to retrieve a sample document from ${collectionName} collection.`);
                }
            }
            // Disconnect from MongoDB
            mongoose_1.default.disconnect();
        }
        catch (err) {
            console.error('Error connecting to MongoDB:', err);
        }
    });
}
exports.generateSchemas = generateSchemas;
