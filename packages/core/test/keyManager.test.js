const fs = require('fs');
const path = require('path');
const os = require('os');

const TMP_PREFIX = path.join(os.tmpdir(), 'dotenv-guard-key-');

function createTempDir() {
  return fs.mkdtempSync(TMP_PREFIX);
}

describe('keyManager (auto key storage)', () => {
  const originalCwd = process.cwd();
  const createdDirs = [];

  beforeEach(() => {
    jest.resetModules();
    delete process.env.DOTENV_GUARD_MASTER_KEY;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.chdir(originalCwd);
    while (createdDirs.length) {
      const dir = createdDirs.pop();
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  test('uses DOTENV_GUARD_MASTER_KEY when provided', () => {
    process.env.DOTENV_GUARD_MASTER_KEY = 'a'.repeat(64);

    jest.isolateModules(() => {
      const { getOrCreateMasterKey, masterKeyExists } = require('../src/keyManager');
      expect(getOrCreateMasterKey()).toBe(process.env.DOTENV_GUARD_MASTER_KEY);
      expect(masterKeyExists()).toBe(true);
    });
  });

  test('persists key inside home directory and reuses it', () => {
    const fakeHome = createTempDir();
    createdDirs.push(fakeHome);
    jest.spyOn(os, 'homedir').mockReturnValue(fakeHome);

    jest.isolateModules(() => {
      const keyManager = require('../src/keyManager');
      const masterKey = 'b'.repeat(64);
      const keyPath = keyManager.saveMasterKey(masterKey);

      expect(fs.readFileSync(keyPath, 'utf8').trim()).toBe(masterKey);
      expect(keyManager.masterKeyExists()).toBe(true);
      expect(keyManager.getOrCreateMasterKey()).toBe(masterKey);
      expect(keyManager.getKeyDirectory()).toBe(path.join(fakeHome, '.dotenv-guard'));
    });
  });

  test('falls back to current working directory when home unavailable', () => {
    const tmpCwd = createTempDir();
    createdDirs.push(tmpCwd);
    process.chdir(tmpCwd);

    jest.spyOn(os, 'homedir').mockReturnValue('/');

    jest.isolateModules(() => {
      const { getKeyDirectory } = require('../src/keyManager');
      expect(getKeyDirectory()).toBe(path.join(tmpCwd, '.dotenv-guard'));
    });
  });

  test('falls back to temp directory when CWD not writable', () => {
    const tmpCwd = createTempDir();
    const fakeTmp = createTempDir();
    createdDirs.push(tmpCwd, fakeTmp);
    process.chdir(tmpCwd);

    const originalWrite = fs.writeFileSync;
    const originalMkdir = fs.mkdirSync;

    jest.spyOn(os, 'homedir').mockReturnValue('/');
    jest.spyOn(os, 'tmpdir').mockReturnValue(fakeTmp);
    jest.spyOn(fs, 'mkdirSync').mockImplementation((target, options) => {
      if (target.startsWith(path.join(tmpCwd, '.dotenv-guard'))) {
        throw new Error('CWD locked');
      }
      return originalMkdir.call(fs, target, options);
    });
    jest.spyOn(fs, 'writeFileSync').mockImplementation((target, data, options) => {
      if (target.startsWith(path.join(tmpCwd, '.dotenv-guard'))) {
        throw new Error('CWD locked');
      }
      return originalWrite.call(fs, target, data, options);
    });

    jest.isolateModules(() => {
      const { getKeyDirectory } = require('../src/keyManager');
      expect(getKeyDirectory()).toBe(path.join(fakeTmp, '.dotenv-guard'));
    });
  });

  test('throws when no writable directory available for master key', () => {
    const tmpDir = createTempDir();
    createdDirs.push(tmpDir);

    jest.spyOn(os, 'homedir').mockReturnValue('/');
    jest.spyOn(os, 'tmpdir').mockReturnValue(tmpDir);
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
      throw new Error('EACCES');
    });
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('EACCES');
    });

    jest.isolateModules(() => {
      const { saveMasterKey } = require('../src/keyManager');
      expect(() => saveMasterKey('c'.repeat(64))).toThrow('No writable directory found');
    });
  });

  test('getOrCreateMasterKey throws when no writable directory available', () => {
    const tmpDir = createTempDir();
    createdDirs.push(tmpDir);

    jest.spyOn(os, 'homedir').mockReturnValue('/');
    jest.spyOn(os, 'tmpdir').mockReturnValue(tmpDir);
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
      throw new Error('EACCES');
    });
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('EACCES');
    });

    jest.isolateModules(() => {
      const { getOrCreateMasterKey } = require('../src/keyManager');
      expect(() => getOrCreateMasterKey()).toThrow('Cannot generate master key');
    });
  });

  test('getOrCreateMasterKey auto-generates and saves key on first use', () => {
    const fakeHome = createTempDir();
    createdDirs.push(fakeHome);
    jest.spyOn(os, 'homedir').mockReturnValue(fakeHome);

    jest.isolateModules(() => {
      const { getOrCreateMasterKey, getKeyDirectory, masterKeyExists, MASTER_KEY_FILE } = require('../src/keyManager');

      expect(masterKeyExists()).toBe(false);

      const key = getOrCreateMasterKey();

      expect(key).toBeTruthy();
      expect(key.length).toBe(64);
      expect(masterKeyExists()).toBe(true);

      const keyPath = path.join(getKeyDirectory(), MASTER_KEY_FILE);
      expect(fs.existsSync(keyPath)).toBe(true);
      expect(fs.readFileSync(keyPath, 'utf8').trim()).toBe(key);
    });
  });
});
