import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";


export const metadata = { title: "غير مصرح — مركز قيادة وصال" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 px-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-status-red-bg">
          <ShieldX className="h-8 w-8 text-status-red" />
        </div>
        <h1 className="text-2xl font-semibold">وصول مرفوض</h1>
        <p className="text-muted-foreground max-w-sm">
          ليس لديك صلاحية لعرض هذه الصفحة. تواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ.
        </p>
        <Button
          variant="outline"
          render={<Link href="/live-operations" />}
        >
          العودة إلى لوحة التحكم
        </Button>
      </div>
    </div>
  );
}
