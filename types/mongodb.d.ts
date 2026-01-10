declare module 'mongodb' {
  export class ObjectId {
    constructor(id?: string | number)
    toString(): string
  }
  
  export class MongoClient {
    constructor(url: string, options?: any)
    connect(): Promise<MongoClient>
    db(name?: string): any
    close(): Promise<void>
  }
  
  export function connect(url: string, options?: any): Promise<MongoClient>
}

