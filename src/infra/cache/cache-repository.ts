export abstract class CacheRepository {
  abstract set(key: string, value: any): Promise<void>
  abstract get(key: string): Promise<any>
  abstract delete(key: string): Promise<void>
}
