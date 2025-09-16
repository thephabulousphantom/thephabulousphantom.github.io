export class AssetLoader {
  constructor() {

    this._cache = new Map();
    this._pending = 0;
    this._idleResolvers = [];
  }

  async loadImage(url) {

    if (this._cache.has(url)) {
      return this._cache.get(url);
    }

    const img = new Image();
    img.decoding = "async";

    this._pending++;

    const promise = new Promise(function(resolve, reject) {

      img.onload = function() {
        resolve(img);
      };

      img.onerror = function(e) {
        reject(new Error("Failed to load image: " + url));
      };
    });

    img.src = url;

    try {
      const result = await promise;
      this._cache.set(url, result);
      return result;
    } finally {
      this._pending = Math.max(0, this._pending - 1);
      if (this._pending === 0) {
        this._flushIdle();
      }
    }
  }

  async waitForIdle() {
    if (this._pending === 0) {
      return;
    }

    return new Promise((resolve) => {
      this._idleResolvers.push(resolve);
    });
  }

  _flushIdle() {
    const list = this._idleResolvers.splice(0, this._idleResolvers.length);
    for (let i = 0; i < list.length; i++) {
      try {
        list[i]();
      } catch (e) {
      }
    }
  }
}
