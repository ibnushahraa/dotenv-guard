/* istanbul ignore file -- legacy keytar-based encryption kept for backward compatibility */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import keytar from "keytar";
import deasync from "deasync";

const SERVICE = "dotenv-guard";
const ACCOUNT = "default";

/**
 * Get encryption key from system keychain (via keytar), or create one if not exists.
 * @returns {Promise<string>} Hex-encoded encryption key (32 bytes -> 64 hex chars)
 */
export async function getOrCreateKey() {
    let key = await keytar.getPassword(SERVICE, ACCOUNT);
    if (!key) {
        key = crypto.randomBytes(32).toString("hex");
        await keytar.setPassword(SERVICE, ACCOUNT, key);
    }
    return key;
}

/**
 * Encrypt a single value.
 * @param {string} value - Plaintext value
 * @returns {Promise<string>} Encrypted value in format "ivHex:cipherHex"
 */
export async function encryptValue(value) {
    const key = await getOrCreateKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key, "hex"), iv);

    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt a single value.
 * @param {string} value - Encrypted string in format "ivHex:cipherHex" or plaintext
 * @returns {Promise<string>} Plaintext value
 */
export async function decryptValue(value) {
    if (!value || !value.includes(":")) return value;

    const parts = value.split(":");
    if (parts.length !== 2) throw new Error("Invalid encrypted value format");

    const [ivHex, encrypted] = parts;
    if (!/^[0-9a-fA-F]+$/.test(ivHex) || !/^[0-9a-fA-F]+$/.test(encrypted)) {
        throw new Error("Invalid encrypted value format (non-hex)");
    }
    const iv = Buffer.from(ivHex, "hex");
    if (iv.length !== 16) throw new Error("Invalid initialization vector");

    const key = await getOrCreateKey();
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "hex"), iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

/**
 * Encrypt all values inside .env file.
 * Only encrypts values not already in "iv:cipher" format.
 * @param {string} [file=".env"] - Path to .env file
 */
export async function encryptEnv(file = ".env") {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) throw new Error(`${file} not found`);

    const raw = fs.readFileSync(filePath, "utf8");
    const lines = raw.split(/\r?\n/);
    const output = [];

    for (const line of lines) {
        if (!line || line.trim() === "" || line.trim().startsWith("#")) {
            output.push(line);
            continue;
        }

        const idx = line.indexOf("=");
        if (idx === -1) {
            output.push(line);
            continue;
        }

        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();

        const parts = value.split(":");
        const alreadyEncrypted =
            parts.length === 2 &&
            /^[0-9a-fA-F]+$/.test(parts[0]) &&
            /^[0-9a-fA-F]+$/.test(parts[1]) &&
            parts[0].length === 32;

        if (!alreadyEncrypted) {
            value = await encryptValue(value);
        }

        output.push(`${key}=${value}`);
    }

    fs.writeFileSync(filePath, output.join("\n"));
}

/**
 * Decrypt all values inside .env file and return as plaintext string.
 * @param {string} [file=".env"] - Path to .env file
 * @returns {Promise<string>} Plaintext .env content
 */
export async function decryptEnv(file = ".env") {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) throw new Error(`${file} not found`);

    const raw = fs.readFileSync(filePath, "utf8");
    const lines = raw.split(/\r?\n/);
    const output = [];

    for (const line of lines) {
        if (!line || line.trim() === "" || line.trim().startsWith("#")) {
            output.push(line);
            continue;
        }

        const idx = line.indexOf("=");
        if (idx === -1) {
            output.push(line);
            continue;
        }

        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();

        let plain = value;
        if (value.includes(":")) {
            plain = await decryptValue(value);
        }

        output.push(`${key}=${plain}`);
    }

    return output.join("\n");
}

/**
 * Inject environment variables into process.env
 * @param {string} content - Raw .env file content
 */
export async function injectToProcess(content) {
    if (!content) return;
    for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === "" || line.trim().startsWith("#")) continue;

        const idx = line.indexOf("=");
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();

        const plain = await decryptValue(value);
        if (key) process.env[key] = plain;
    }
}

/**
 * Load env schema JSON if exists.
 * @param {string} [schemaFile="env.schema.json"]
 * @returns {Object|null}
 */
export function loadSchema(schemaFile = "env.schema.json") {
    const schemaPath = path.join(process.cwd(), schemaFile);
    if (!fs.existsSync(schemaPath)) return null;
    return JSON.parse(fs.readFileSync(schemaPath, "utf8"));
}

/**
 * Validate process.env against schema.
 * @param {NodeJS.ProcessEnv} env - Current environment variables
 * @param {Object} schema - Validation schema
 */
export function validateEnv(env, schema) {
    let errors = [];

    for (const key in schema) {
        const rules = schema[key];
        const value = env[key];

        if (rules.required !== false && !value) {
            errors.push(`Missing required env: ${key}`);
            continue;
        }

        if (rules.regex && value && !new RegExp(rules.regex).test(value)) {
            errors.push(`Env ${key}="${value}" does not match ${rules.regex}`);
        }

        if (rules.enum && value && !rules.enum.includes(value)) {
            errors.push(`Env ${key}="${value}" must be one of: ${rules.enum.join(", ")}`);
        }
    }

    if (errors.length) {
        errors.forEach((e) => console.error("❌", e));
        console.error("⛔ dotenv-guard: validation failed.");
        process.exit(1);
    }
}

/**
 * Load .env file into process.env
 * @param {string} [file=".env"] - Path to .env file
 * @param {boolean} [enc=true] - Encryption mode
 */
export async function loadEnv(file = ".env", enc = true) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) throw new Error(`${file} not found`);

    let content = fs.readFileSync(filePath, "utf8");

    const fileHasEncryptedValue = (() => {
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            if (!line || line.trim() === "" || line.trim().startsWith("#")) continue;
            const idx = line.indexOf("=");
            if (idx === -1) continue;
            const value = line.slice(idx + 1).trim();
            const parts = value.split(":");
            if (
                parts.length === 2 &&
                /^[0-9a-fA-F]+$/.test(parts[0]) &&
                /^[0-9a-fA-F]+$/.test(parts[1]) &&
                parts[0].length === 32
            ) {
                return true;
            }
        }
        return false;
    })();

    if (enc === true) {
        await encryptEnv(file);
        content = fs.readFileSync(filePath, "utf8");
    } else {
        if (fileHasEncryptedValue) {
            const plaintext = await decryptEnv(file);
            fs.writeFileSync(filePath, plaintext);
            content = plaintext;
        }
    }

    await injectToProcess(content);
}

/**
 * API similar to dotenv.config()
 * @param {Object} [options]
 * @param {string} [options.path=".env"] - Path to .env file (single file mode)
 * @param {string} [options.mode] - Environment mode for multi-file loading (development/production/test)
 * @param {boolean} [options.multiEnv=false] - Enable multi-env file loading (.env, .env.local, .env.[mode], etc)
 * @param {boolean} [options.enc=true] - Encryption mode
 * @param {boolean} [options.validator=false] - Enable validation
 * @param {string} [options.schema="env.schema.json"] - Schema file
 */
export async function config(options = {}) {
    const enc = options.enc === undefined ? true : !!options.enc;

    try {
        // Multi-env mode: load multiple .env files based on mode
        if (options.multiEnv) {
            const { getEnvFiles, getSchemaFile } = await import("./multi-env.mjs");
            const envFiles = getEnvFiles(options.mode);

            if (envFiles.length === 0) {
                console.warn("⚠️ No .env files found for mode:", options.mode || process.env.NODE_ENV || 'development');
            }

            // Load all env files in order (later files override earlier ones)
            for (const filePath of envFiles) {
                const fileName = path.basename(filePath);
                await loadEnv(fileName, enc);
            }

            // Load schema based on mode
            if (options.validator) {
                const schemaPath = getSchemaFile(options.mode);
                if (schemaPath) {
                    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                    validateEnv(process.env, schema);
                } else {
                    console.error("⚠️ Validator enabled but schema file not found");
                }
            }
        }
        // Single file mode (backward compatible)
        else {
            const file = options.path || ".env";
            await loadEnv(file, enc);

            if (options.validator) {
                const schema = loadSchema(options.schema || "env.schema.json");
                if (schema) {
                    validateEnv(process.env, schema);
                } else {
                    console.error("⚠️ Validator enabled but schema file not found");
                }
            }
        }
    } catch (err) {
        console.error("❌ dotenv-guard failed:", err.message);
        process.exit(1);
    }
}

/**
 * Wrap async function into sync using deasync.
 * @param {Function} promiseFn - Async function
 * @returns {Function} Synchronous version
 */
export function deasyncify(promiseFn) {
    return function (...args) {
        let result, error, done = false;
        promiseFn(...args)
            .then((res) => {
                result = res;
                done = true;
            })
            .catch((err) => {
                error = err;
                done = true;
            });
        deasync.loopWhile(() => !done);
        if (error) throw error;
        return result;
    };
}
