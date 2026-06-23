/* ============================================
   PRATAP TRAVELS - Crypto Module
   AES-GCM encryption with PBKDF2 key derivation
   Using Web Crypto API (no external dependencies)
   ============================================ */

var PratapCrypto = (function () {
  'use strict';

  var SALT_LENGTH = 16;
  var IV_LENGTH = 12;
  var PBKDF2_ITERATIONS = 100000;
  var KEY_LENGTH = 256;

  /**
   * Convert an ArrayBuffer to a Base64 string
   */
  function bufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = '';
    for (var i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert a Base64 string to an ArrayBuffer
   */
  function base64ToBuffer(base64) {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate a random salt
   */
  function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  }

  /**
   * Generate a random initialization vector
   */
  function generateIV() {
    return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  }

  /**
   * Derive an AES-GCM key from a passphrase using PBKDF2
   */
  async function deriveKey(passphrase, salt) {
    var encoder = new TextEncoder();
    var keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt a string with AES-GCM
   * Returns a Base64-encoded string containing salt + iv + ciphertext
   */
  async function encrypt(plaintext, passphrase) {
    var encoder = new TextEncoder();
    var salt = generateSalt();
    var iv = generateIV();
    var key = await deriveKey(passphrase, salt);

    var ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(plaintext)
    );

    // Pack salt + iv + ciphertext into a single buffer
    var saltBuffer = new Uint8Array(salt);
    var ivBuffer = new Uint8Array(iv);
    var cipherBuffer = new Uint8Array(ciphertext);

    var packed = new Uint8Array(saltBuffer.length + ivBuffer.length + cipherBuffer.length);
    packed.set(saltBuffer, 0);
    packed.set(ivBuffer, saltBuffer.length);
    packed.set(cipherBuffer, saltBuffer.length + ivBuffer.length);

    return bufferToBase64(packed.buffer);
  }

  /**
   * Decrypt a Base64-encoded AES-GCM encrypted string
   * Input format: salt + iv + ciphertext (all packed in Base64)
   */
  async function decrypt(encryptedBase64, passphrase) {
    var packed = new Uint8Array(base64ToBuffer(encryptedBase64));

    // Extract salt, iv, and ciphertext
    var salt = packed.slice(0, SALT_LENGTH);
    var iv = packed.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    var ciphertext = packed.slice(SALT_LENGTH + IV_LENGTH);

    var key = await deriveKey(passphrase, salt);

    var decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    var decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Encrypt a JSON object and return encrypted string
   */
  async function encryptJSON(jsonObject, passphrase) {
    var jsonString = JSON.stringify(jsonObject, null, 2);
    return encrypt(jsonString, passphrase);
  }

  /**
   * Decrypt an encrypted string back to a JSON object
   */
  async function decryptJSON(encryptedBase64, passphrase) {
    var jsonString = await decrypt(encryptedBase64, passphrase);
    return JSON.parse(jsonString);
  }

  /**
   * Check if Web Crypto API is available
   */
  function isSupported() {
    return typeof crypto !== 'undefined' &&
           typeof crypto.subtle !== 'undefined';
  }

  // Public API
  return {
    encrypt: encrypt,
    decrypt: decrypt,
    encryptJSON: encryptJSON,
    decryptJSON: decryptJSON,
    isSupported: isSupported
  };
})();
