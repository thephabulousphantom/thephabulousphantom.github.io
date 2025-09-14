export class AssetLoader {
  constructor() {

    this._cache = new Map();
  }

  async loadImage(url) {

    if (this._cache.has(url)) {
      return this._cache.get(url);
    }

    const img = new Image();
    img.decoding = "async";

    const promise = new Promise(function(resolve, reject) {

      img.onload = function() {
        resolve(img);
      };

      img.onerror = function(e) {
        reject(new Error("Failed to load image: " + url));
      };
    });

    img.src = url;

    const result = await promise;
    this._cache.set(url, result);
    return result;
  }
}
