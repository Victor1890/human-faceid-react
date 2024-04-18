const database = 'test'
const table = 'person'

interface FaceRecord {
    id: number
    name: string
    desc: number[]
    image: ImageData
}

export class Database {

    public static _instance: Database
    private db: IDBDatabase | undefined

    public static get instance(): Database {
        if (!Database._instance) {
            Database._instance = new Database()
        }
        return Database._instance
    }

    private constructor() { }

    public async settings() {
        if (this.db) return true

        return new Promise((resolve) => {
            const request = indexedDB.open(database)

            request.onerror = (err) => console.error('Database error: ', err)

            request.onupgradeneeded = (event) => {
                console.log("create database: ", event.target)
                this.db = (event.target as IDBOpenDBRequest).result
                this.db.createObjectStore(table, { keyPath: 'id', autoIncrement: true })
            }

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result
                console.log("Database opened: ", this.db)
                resolve(true)
            }
        })
    }

    public async load(): Promise<FaceRecord[]> {
        const faceDb: FaceRecord[] = []
        return new Promise((resolve) => {
            const cursor = this.db?.transaction([table], 'readonly').objectStore(table).openCursor(null, 'next')
            if (!cursor) return resolve(faceDb)

            cursor.onerror = (err) => console.error('Cursor error: ', err)
            cursor.onsuccess = (event) => {
                const result = (event.target as IDBRequest).result

                if (result) faceDb.push(result.value)
                else resolve(faceDb)
            }
        })
    }

    public async save(record: Omit<FaceRecord, "id">): Promise<boolean> {
        this.db?.transaction([table], 'readwrite').objectStore(table).put(record);
        return true;
    }

    public async delete(id: number): Promise<boolean> {
        this.db?.transaction([table], 'readwrite').objectStore(table).delete(id);
        return true;
    }
}