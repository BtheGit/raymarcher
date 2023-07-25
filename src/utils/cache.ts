export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private cacheOrder: K[];
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.cacheOrder = [];
    this.maxSize = maxSize;
  }

  private updateCacheOrder = (key: K) => {
    const index = this.cacheOrder.indexOf(key);
    if (index !== -1) {
      this.cacheOrder.splice(index, 1);
    }
    this.cacheOrder.unshift(key);
  };

  public get = (key: K): V | undefined => {
    if (this.cache.has(key)) {
      this.updateCacheOrder(key);
      return this.cache.get(key);
    }
  };

  public set = (key: K, value: V) => {
    if (this.cache.size >= this.maxSize) {
      const lastKey = this.cacheOrder.pop();
      if (lastKey) {
        this.cache.delete(lastKey);
      }
    }

    this.cache.set(key, value);
    this.updateCacheOrder(key);
  };

  public clear = () => {
    this.cache.clear();
    this.cacheOrder = [];
  };

  public size = () => {
    return this.cache.size;
  };

  public getMaxSize = () => {
    return this.maxSize;
  };
}
