import { SignInForm } from "./sign-in-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Sign in — Wisal Command Center" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/live-operations");

  const { callbackUrl } = await searchParams;

  return (
    <div className="w-full max-w-sm px-4">
      {/* Logo / wordmark */}
      <div className="mb-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold mb-4">
          W
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Wisal Command Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to your account
        </p>
      </div>

      <SignInForm callbackUrl={callbackUrl ?? "/live-operations"} />
    </div>
  );
}
