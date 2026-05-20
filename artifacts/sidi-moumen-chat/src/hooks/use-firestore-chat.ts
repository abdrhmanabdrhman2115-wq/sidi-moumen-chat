import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getCountFromServer,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { User } from "firebase/auth";

export type ChatMessage = {
  id: string;
  content: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  createdAt: Date;
  imageURL?: string;
  audioURL?: string;
};

export function useMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            content: data.content as string,
            userId: data.userId as string,
            userDisplayName: data.userDisplayName as string,
            userPhotoURL: (data.userPhotoURL as string | null) ?? null,
            imageURL: (data.imageURL as string | undefined) ?? undefined,
            audioURL: (data.audioURL as string | undefined) ?? undefined,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(),
          };
        })
      );
      setIsLoading(false);
    });

    return unsub;
  }, []);

  return { messages, isLoading };
}

export async function sendMessage(user: User, content: string, imageFile?: File, audioFile?: File) {
  const messageData: any = {
    content,
    userId: user.uid,
    userDisplayName: user.displayName ?? "Anonymous",
    userPhotoURL: user.photoURL ?? null,
    createdAt: serverTimestamp(),
  };

  // Upload image if provided
  if (imageFile) {
    const imageRef = ref(storage, `images/${user.uid}/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    messageData.imageURL = await getDownloadURL(imageRef);
  }

  // Upload audio if provided
  if (audioFile) {
    const audioRef = ref(storage, `audio/${user.uid}/${Date.now()}_${audioFile.name}`);
    await uploadBytes(audioRef, audioFile);
    messageData.audioURL = await getDownloadURL(audioRef);
  }

  await addDoc(collection(db, "messages"), messageData);
}

export async function deleteMessage(id: string) {
  await deleteDoc(doc(db, "messages", id));
}

export function useChatStats() {
  const [stats, setStats] = useState({ totalMessages: 0, totalMembers: 0, messagesLast24h: 0 });

  useEffect(() => {
    async function fetchStats() {
      const messagesRef = collection(db, "messages");
      const membersRef = collection(db, "members");

      const [totalMessages, totalMembers] = await Promise.all([
        getCountFromServer(query(messagesRef)),
        getCountFromServer(query(membersRef)),
      ]);

      const yesterday = Timestamp.fromDate(new Date(Date.now() - 86400000));
      const last24h = await getCountFromServer(
        query(messagesRef, where("createdAt", ">=", yesterday))
      );

      setStats({
        totalMessages: totalMessages.data().count,
        totalMembers: totalMembers.data().count,
        messagesLast24h: last24h.data().count,
      });
    }

    fetchStats();
  }, []);

  return stats;
}

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<
    { id: string; displayName: string; photoURL: string | null; lastActiveAt: Date }[]
  >([]);

  useEffect(() => {
    const fifteenMinutesAgo = Timestamp.fromDate(new Date(Date.now() - 15 * 60 * 1000));
    const q = query(
      collection(db, "members"),
      where("lastActiveAt", ">=", fifteenMinutesAgo),
      orderBy("lastActiveAt", "desc"),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      setOnlineUsers(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            displayName: data.displayName as string,
            photoURL: (data.photoURL as string | null) ?? null,
            lastActiveAt:
              data.lastActiveAt instanceof Timestamp
                ? data.lastActiveAt.toDate()
                : new Date(),
          };
        })
      );
    });

    return unsub;
  }, []);

  return onlineUsers;
}
