import { auth } from "@/lib/firebase";
import {
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Cookies from "js-cookie";

export const signIn = async (email: string, password: string) => {
  try {
    console.log("Signing in with email:", email);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    const token = await user.getIdToken();

    Cookies.set("tubini-token", token, { expires: 7, path: "/" });

    return user;
  } catch (error: unknown) {
    const errorCode = (error as { code: string }).code || "unknown";
    const errorMessage = (error as { message: string }).message;
    throw new Error(`Error signing in: ${errorCode} - ${errorMessage}`);
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);

    Cookies.remove("tubini-token", { path: "/" });
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
