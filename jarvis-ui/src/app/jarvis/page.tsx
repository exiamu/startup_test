import { JarvisClient } from "@/app/jarvis/jarvis-client";

type JarvisPageProps = {
  searchParams: Promise<{
    sessionId?: string;
  }>;
};

export default async function JarvisPage({ searchParams }: JarvisPageProps) {
  const { sessionId } = await searchParams;

  return <JarvisClient initialSessionId={sessionId ?? null} />;
}
