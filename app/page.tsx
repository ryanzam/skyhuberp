'use client'

import { Tally5 } from "lucide-react";
import Loading from "./components/ui/Loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/auth/signin')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center">
          <Tally5 className="h-16 w-16 text-blue-600" />
        </div>
        <h1 className="font-bold mb-3">SkyhubERP</h1>
        <Loading />
        <p className="mt-4 text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  );
}
