import crypto from "crypto";
import fs from "fs";
import forge from "node-forge";

// Generate the key pair(public key and private key)
export function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

// Function to encrypt the password with the public key
export function encryptWithPublicKey(plaintext) {
  // Read the public key from the .pem file
  const publicKeyPem = fs.readFileSync("./public_key.pem", "utf8");

  // Parse the public key from the PEM format
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  // Convert the data to binary
  const plaintextBytes = forge.util.encodeUtf8(plaintext);

  // Encrypt the plaintext using the public key
  const encryptedBytes = publicKey.encrypt(plaintextBytes, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });

  // Convert the encrypted data to Base64 string
  const encryptedData = forge.util.encode64(encryptedBytes);

  // Return the encrypted data
  return encryptedData;
}

// Use private key to decrypt data
export function decryptWithPrivateKey(encryptedData) {
  // Convert the encrypted data from Base64 to Bytes
  const encryptedBytes = forge.util.decode64(encryptedData);

  // Read the private key from the .pem file
  const privateKeyPem = fs.readFileSync("./private_key.pem", "utf8");

  // Parse the private key from the PEM format
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  // Decrypt the encrypted data using the private key
  const decryptedDataBinary = privateKey.decrypt(encryptedBytes, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  // Convert the decrypted binary data to a string
  const decryptedData = forge.util.decodeUtf8(decryptedDataBinary);
  return decryptedData;
}
