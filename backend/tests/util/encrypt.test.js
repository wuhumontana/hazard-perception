import crypto from "crypto";
import { describe, expect, it } from "vitest";
import { generateKeyPair, decryptWithPrivateKey } from "../../src/util/encrypt";

describe("Test generateKeyPair", () => {
  it("should return a public key and private key", () => {
    const result = generateKeyPair();
    expect(result).toHaveProperty("publicKey");
    expect(result).toHaveProperty("privateKey");
  });
  it("should return a public key and private key of type string", () => {
    const result = generateKeyPair();
    expect(typeof result.publicKey).toBe("string");
    expect(typeof result.privateKey).toBe("string");
  });
  it("should return a public key and private key of length greater than 0", () => {
    const result = generateKeyPair();
    expect(result.publicKey.length).toBeGreaterThan(0);
    expect(result.privateKey.length).toBeGreaterThan(0);
  });
  it("should return a public key and private key of rsa type", () => {
    const result = generateKeyPair();
    expect(result.publicKey).toMatch(/-----BEGIN PUBLIC KEY-----/);
    expect(result.privateKey).toMatch(/-----BEGIN PRIVATE KEY-----/);
  });
  it("should return a public key and private key of pem format", () => {
    const result = generateKeyPair();
    expect(result.publicKey).toMatch(/-----END PUBLIC KEY-----/);
    expect(result.privateKey).toMatch(/-----END PRIVATE KEY-----/);
  });
  it("should return a public key and private key of spki and pkcs8 format", () => {
    const result = generateKeyPair();
    expect(result.publicKey).toMatch(/BEGIN PUBLIC KEY/);
    expect(result.privateKey).toMatch(/BEGIN PRIVATE KEY/);
  });
});

const publicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjU8t9z0UtiSaO7JUHvMp
ln1VFJ3QJgoKyOorhWvt2Xj0jZ9d1QpD2PjV/A5n3VoOsnLzkhHOlXooSqHbuB2D
n4g6fzbI2N+Y0KggtZGhjtwVVEyaI3LMWVI+S80gRrcY+sP/SvPniuMJoJDfc1Gf
KK5lmfB2CjTCV0LZBMWA9JSiN4ngRhVQ69sAOhAo1HaY7R+CXhlSPTKfcZqkpSjj
n6DyDaQXI5YeoQOsDxDWelqftfr8lTSDh+tOkjGL7irUStaxG5zYJyYAF1OMM4Ae
x2NLD373UGtdlOT7STi3UvsNdvDpDrY5O1HteNaxC1S815UZU3U/u5lvANQB16aO
pQIDAQAB
-----END PUBLIC KEY-----
`;

describe("Test decryptWithPrivateKey", () => {
  it("should return decrypted data", () => {
    let encryptedData = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      "foobar"
    );
    encryptedData = encryptedData.toString("base64");
    const result = decryptWithPrivateKey(encryptedData);
    expect(result).toBe("foobar");
  });
});
