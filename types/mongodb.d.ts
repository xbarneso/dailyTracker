declare module 'mongodb' {
  export class ObjectId {
    constructor(id?: string | number)
    toString(): string
  }
  
  export interface Db {
    collection<T = any>(name: string): Collection<T>
    command(command: any): Promise<any>
    listCollections(): Cursor<any>
  }
  
  export interface Collection<T = any> {
    find(query: any): Cursor<T>
    findOne(query: any): Promise<T | null>
    insertOne(doc: T): Promise<{ insertedId: ObjectId }>
    updateOne(filter: any, update: any, options?: any): Promise<any>
    deleteOne(filter: any): Promise<{ deletedCount: number }>
    findOneAndUpdate(filter: any, update: any, options?: any): Promise<{ value: T | null }>
  }
  
  export interface Cursor<T = any> {
    toArray(): Promise<T[]>
    sort(sort: any): Cursor<T>
  }
  
  export class MongoClient {
    constructor(url: string, options?: any)
    connect(): Promise<MongoClient>
    db(name?: string): Db
    close(): Promise<void>
  }
  
  export function connect(url: string, options?: any): Promise<MongoClient>
}

