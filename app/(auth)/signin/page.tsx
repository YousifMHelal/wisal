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
  if (session?.user) redirect("/overview");

  const { callbackUrl } = await searchParams;

  return (
    <div className="w-full">
      {/* Logo / wordmark */}
      <div className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-5 shadow-lg shadow-primary/25">
          W
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          مركز قيادة وصال
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          سجّل دخولك للمتابعة
        </p>
      </div>

      <SignInForm callbackUrl={callbackUrl ?? "/overview"} />

      <p className="mt-6 text-center text-xs text-muted-foreground/60">
        لوحة عمليات هيئة الهلال الأحمر · سري
      </p>
    </div>
  );
}
