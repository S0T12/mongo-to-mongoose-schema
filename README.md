# mongo-to-mongoose-schema

A TypeScript package that generates Nest.js/Mongoose schemas from existing MongoDB collections.

## Installation

```bash
npm install 
```

## Usage

```typescript
import { generateMongooseSchemas } from 'mongo-to-mongoose-schema';

generateMongooseSchemas('mongodb://localhost/your-database', './schemas');
```

This will generate TypeScript schema files for all non-empty collections in the `your-database` database and place them in the `./schemas` directory.

## How it works

1. The package connects to the provided MongoDB database URI.
2. It retrieves a list of all collections, excluding system collections.
3. For each non-empty collection:
   - It fetches a sample document from the collection.
   - It infers the schema structure based on the sample document's properties and data types.
   - It generates a TypeScript schema file for the Nest.js/Mongoose model, using the inferred schema structure.

## Generated Schema File

The generated schema file will have the following structure:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'your_collection_name' })
export class YourCollectionName {
  @Prop()
  propertyName: any;

  // ... other properties
}

export const YourCollectionNameSchema = SchemaFactory.createForClass(YourCollectionName);
```

You can then import and use the generated schema in your Nest.js application.

## Configuration

The `generateMongooseSchemas` function accepts two arguments:

1. `databaseUri` (string): The MongoDB connection URI.
2. `outputDir` (string): The output directory where the schema files will be generated.

## Limitations

- The package generates schemas based on a single sample document from each collection. If the documents in a collection have varying structures, the generated schema may not accurately represent all possible data shapes.
- Nested objects and arrays are supported up to a maximum depth of 5 levels to avoid potential circular references. This depth can be adjusted in the `utils.ts` file by modifying the `MAX_DEPTH` constant.
- The package currently generates schemas with `any` types for properties. You may need to manually adjust the schemas to specify the correct types based on your application requirements.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests on the [GitHub repository](https://github.com/S0T12/mongo-to-mongoose-schema).

## License

This project is licensed under the [MIT License](LICENSE).