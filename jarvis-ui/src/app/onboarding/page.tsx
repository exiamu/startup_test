import { OnboardingClient } from "@/app/onboarding/onboarding-client";

type OnboardingPageProps = {
  searchParams: Promise<{
    ai?: string;
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { ai } = await searchParams;

  return <OnboardingClient initialAi={ai ?? "claude"} />;
}
