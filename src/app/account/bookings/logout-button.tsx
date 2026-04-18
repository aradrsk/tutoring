"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut(auth);
        await fetch("/api/auth/session", { method: "DELETE" });
        router.push("/");
        router.refresh();
      }}
      className="rounded-2xl border-2 border-[#191A23] bg-white px-4 py-2 text-sm font-medium transition hover:bg-[#191A23] hover:text-white"
    >
      Log out
    </button>
  );
}
