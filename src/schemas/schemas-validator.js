import * as AjvSchemas from './ajv-schemas.cjs'

export default class SchemasValidator {

  // Validate schema
  static validateSchema($id, data) {
    // Allow input short schema id instead of full URI $id.
    let base
    if (!$id.startsWith('http')) {
      base = 'https://schema.v4ex.com'
    }
    const uri = new URL($id, base)

    const valid = AjvSchemas[uri.href](data)

    return valid
  }
  
}
