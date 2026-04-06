import "dotenv/config";
import crypto from "crypto";

// Load Master Key Encryption Key From Environment Variables
const MASTER_KEY = Buffer.from(
    process.env.MASTER_ENCRYPTION_KEY!,
    "hex"
);

export const encrypt = (text: string) => {

    // Step 1: Generate A Fresh Per-Record Data Encryption Key
    const dek = crypto.randomBytes(32);

    // Step 2: Generate A Random IV For Data Encryption
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        dek,
        iv
    );

    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([
        encrypted,
        cipher.final()
    ]);

    // Step 3: Encrypt The DEK Using The Master Key (KEK)
    const dekIv = crypto.randomBytes(16);

    const dekCipher =
        crypto.createCipheriv(
            "aes-256-cbc",
            MASTER_KEY,
            dekIv
        );

    let encryptedDek =
        dekCipher.update(dek);

    encryptedDek = Buffer.concat([
        encryptedDek,
        dekCipher.final()
    ]);

    return {
        iv: iv.toString("hex"),
        data: encrypted.toString("hex"),
        dek: encryptedDek.toString("hex"),
        dekIv: dekIv.toString("hex")
    };
};
