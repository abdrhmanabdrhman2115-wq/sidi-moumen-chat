import { useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "firebase/auth";

export function usePresence(user: User | null) {
  useEffect(() => {
    if (!user) return;

    const memberRef = doc(db, "members", user.uid);

    const update = () => {
      setDoc(
        memberRef,
        {
          displayName: user.displayName ?? "Anonymous",
          photoURL: user.photoURL ?? null,
          lastActiveAt: serverTimestamp(),
        },
        { merge: true }
      );
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [user]);
}
