class DataManager {

    constructor() {

    }

    async get(key, defaultValue) {

        var value = window.localStorage.getItem(key);

        if (!value && defaultValue !== undefined) {

            return defaultValue;
        }

        return JSON.parse(value);
    }

    async set (key, value) {

        window.localStorage.setItem(key, JSON.stringify(value));
        return value;
    }
}

const dataManager = new DataManager();

export default dataManager;