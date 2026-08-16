import type { NUser } from '@nostrify/react/login';

interface Nip44Signer {
  nip44: {
    encrypt(recipientPubkey: string, plaintext: string): Promise<string>;
    decrypt(authorPubkey: string, ciphertext: string): Promise<string>;
  };
}

type Signer = NUser['signer'];

export async function encryptRecipeForRecipients(
  content: object,
  recipientPubkeys: string[],
  signer: Signer
): Promise<Record<string, string>> {
  const s = signer as unknown as Nip44Signer;
  const plaintext = JSON.stringify(content);
  const encrypted: Record<string, string> = {};

  for (const pubkey of recipientPubkeys) {
    encrypted[pubkey] = await s.nip44.encrypt(pubkey, plaintext);
  }

  return encrypted;
}

export async function decryptRecipeForSelf(
  encryptedMap: Record<string, string>,
  ownPubkey: string,
  authorPubkey: string,
  signer: Signer
): Promise<object | null> {
  const ciphertext = encryptedMap[ownPubkey];
  if (!ciphertext) return null;

  const s = signer as unknown as Nip44Signer;
  try {
    const plaintext = await s.nip44.decrypt(authorPubkey, ciphertext);
    return JSON.parse(plaintext) as object;
  } catch {
    return null;
  }
}
