import type { NUser } from "@nostrify/react/login";

export async function encryptIngredientForRecipients(
  content: object,
  recipientPubkeys: string[],
  signer: NUser["signer"],
): Promise<Record<string, string>> {
  if (!signer.nip44) {
    throw new Error("Signer unterstützt NIP-44 nicht. Bitte Signer erweitern.");
  }

  const plainText = JSON.stringify(content);
  const encrypted: Record<string, string> = {};

  for (const pubkey of recipientPubkeys) {
    encrypted[pubkey] = await signer.nip44.encrypt(pubkey, plainText);
  }

  return encrypted;
}

export async function decryptIngredientForSelf(
  encryptedMap: Record<string, string>,
  ownPubkey: string,
  authorPubkey: string,
  signer: NUser["signer"],
): Promise<object | null> {
  if (!signer.nip44) {
    throw new Error("Signer unterstützt NIP-44 nicht. Bitte Signer erweitern.");
  }

  const cipherText = encryptedMap[ownPubkey];
  if (!cipherText) {
    return null;
  }

  try {
    const plainText = await signer.nip44.decrypt(authorPubkey, cipherText);
    return JSON.parse(plainText) as object;
  } catch {
    return null;
  }
}
