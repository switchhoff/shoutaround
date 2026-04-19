import {
  signInAnonymously,
  onAuthStateChanged,
  linkWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export async function signInAnon(): Promise<User> {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function linkGoogle(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  return linkWithCredential(auth.currentUser!, credential);
}

export async function linkApple(idToken: string, nonce: string) {
  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({ idToken, rawNonce: nonce });
  return linkWithCredential(auth.currentUser!, credential);
}

export function currentUser() {
  return auth.currentUser;
}
