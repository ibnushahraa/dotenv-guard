// src/index.mjs
import {
    encryptEnv as _encryptEnv,
    decryptEnv as _decryptEnv,
    loadEnv as _loadEnv,
    config as _config,
    deasyncify,
} from "./encryption.mjs";

export const encryptEnv = deasyncify(_encryptEnv);
export const decryptEnv = deasyncify(_decryptEnv);
export const loadEnv = deasyncify(_loadEnv);
export const config = deasyncify(_config);

export default {
    encryptEnv,
    decryptEnv,
    loadEnv,
    config,
};
