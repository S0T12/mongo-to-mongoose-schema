import { Schema, SchemaDefinitionProperty, Types } from 'mongoose';
import fs from 'fs';

const MAX_DEPTH = 5;


/**
 * Generates a Mongoose schema definition from a sample document.
 *
 * @param doc The sample document from which the schema will be inferred.
 * @param depth The current depth of recursion (used for handling nested objects and arrays).
 * @param visited A list of visited objects to avoid circular references.
 * @returns The inferred schema definition.
 */
export function generateSchemaFromSampleDoc(doc: any, depth = 0, visited: any[] = []): SchemaDefinitionProperty {
  if (doc && doc._doc) {
    doc = doc._doc;
  }

  const schema: Record<string, any> = {};

  if (depth > MAX_DEPTH || visited.includes(doc)) {
    return Schema.Types.Mixed;
  }

  visited.push(doc);

  if (Array.isArray(doc)) {
    if (doc.length === 0) {
      return [Schema.Types.Mixed];
    }
    const arrayType = generateSchemaFromSampleDoc(doc[0], depth + 1, visited);
    return [arrayType];
  } else if (typeof doc === 'object' && doc !== null) {
    for (const key in doc) {
      if (Object.prototype.hasOwnProperty.call(doc, key)) {
        if (key === '_id') {
          continue;
        }
        const value = doc[key];
        schema[key] = generateSchemaFromSampleDoc(value, depth + 1, visited);
      }
    }
  } else {
    console.log('doc type: ', typeof doc, ' doc', doc);
    switch (typeof doc) {
      case 'string':
        return String;
      case 'number':
        return Number;
      case 'boolean':
        return Boolean;
      case 'object':
        if (doc === null) {
          return Schema.Types.Mixed;
        } else if (doc instanceof Date) {
          return Date;
        } else if (Types.ObjectId.isValid(doc)) {
          return Schema.Types.ObjectId;
        } else {
          return Object;
        }
      default:
        return Schema.Types.Mixed;
    }
  }

  return schema;
}

/**
 * Generates a TypeScript schema file for a Nest.js/Mongoose model.
 *
 * @param collectionName The name of the collection/model.
 * @param schema The inferred schema definition.
 * @param filePath The output file path for the generated schema file.
 * @param databaseName The name of the database.
 */
export function generateSchemaFile(collectionName: string, schema: SchemaDefinitionProperty, filePath: string, databaseName: string) {
  const fileContent = `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: '${collectionName}' })
export class ${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} extends Document {
${Object.entries(schema)
    .map(([key, value]) => `  @Prop()
  ${key}: ${getType(value)};`)
    .join('\n\n')}
}

export const ${collectionName}Schema = SchemaFactory.createForClass(${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)});
`;

  fs.writeFileSync(filePath, fileContent, 'utf-8');
}

function getType(value: any): string {
  if (Array.isArray(value)) {
    return `[${getType(value[0])}]`;
  } else if (value === String || value === Number || value === Boolean) {
    return value.name;
  } else if (value === Date) {
    return 'Date';
  } else if (value === Schema.Types.ObjectId) {
    return 'Types.ObjectId';
  } else if (value instanceof Types.ObjectId) {
    return 'Types.ObjectId';
  } else if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value);
    console.log('entries: ', entries);
    
    if (entries.length === 0) {
      return 'Object';
    } else {
      let isObjectId = true;
      const typeString = '{ ' + entries
        .map(([key, subValue]) => {
          const subType = getType(subValue);
          if (subType !== 'Types.ObjectId') {
            isObjectId = false;
          }
          return `${key}: ${subType};`;
        })
        .join(' ') + ' }';
      return isObjectId ? 'Types.ObjectId' : typeString;
    }
  } else {
    return 'any';
  }
}
