import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";


export const metadata = { title: "Unauthorized — Wisal Command Center" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 px-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-status-red-bg">
          <ShieldX className="h-8 w-8 text-status-red" />
        </div>
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
          You do not have permission to view this page. Contact your
          administrator if you believe this is an error.
        </p>
        <Button
          variant="outline"
          render={<Link href="/live-operations" />}
        >
          Return to dashboard
        </Button>
      </div>
    </div>
  );
}
