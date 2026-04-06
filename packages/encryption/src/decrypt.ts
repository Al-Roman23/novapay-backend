import "dotenv/config";
import crypto from "crypto";

// Load Master Key Encryption Key From Environment Variables
const MASTER_KEY = Buffer.from(
    process.env.MASTER_ENCRYPTION_KEY!,
    "hex"
);

export const decrypt = (payload: any) => {

    const dekIv = Buffer.from(
        payload.dekIv,
        "hex"
    );

    const encryptedDek =
        Buffer.from(payload.dek, "hex");

    // Step 1: Decrypt The DEK Using The Master Key (KEK)
    const dekDecipher =
        crypto.createDecipheriv(
            "aes-256-cbc",
            MASTER_KEY,
            dekIv
        );

    let dek =
        dekDecipher.update(
            encryptedDek
        );

    dek = Buffer.concat([
        dek,
        dekDecipher.final()
    ]);

    // Step 2: Use The Decrypted DEK To Decrypt The Actual Data
    const iv =
        Buffer.from(payload.iv, "hex");

    const encrypted =
        Buffer.from(payload.data, "hex");

    const decipher =
        crypto.createDecipheriv(
            "aes-256-cbc",
            dek,
            iv
        );

    let decrypted =
        decipher.update(encrypted);

    decrypted = Buffer.concat([
        decrypted,
        decipher.final()
    ]);

    return decrypted.toString();
};
