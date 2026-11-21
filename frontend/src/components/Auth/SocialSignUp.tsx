"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const SocialSignUp = () => {
  const { signInWithGoogle, demoLogin } = useAuth();
  const router = useRouter();

  const handleGoogle = async () => {
    const ok = await signInWithGoogle();
    if (ok) router.push("/dashboard");
  };

  const handleDemo = () => {
    demoLogin("owner");
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        type="button"
        onClick={handleDemo}
        className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-semibold py-3 h-auto text-xs flex items-center justify-center gap-2"
      >
        <ShieldCheck className="w-4 h-4" /> Instant Demo Access (Principal: Hemanya)
      </Button>

      <div className="flex gap-3 w-full">
        <Button
          type="button"
          onClick={handleGoogle}
          className="flex-1 shrink gap-2.5 rounded-lg p-3 hover:bg-white/10 bg-white/5 text-white cursor-pointer h-auto border border-white/10 text-xs"
        >
          Google Auth
        </Button>

        <Button
          type="button"
          onClick={() => {
            demoLogin("admin");
            router.push("/dashboard");
          }}
          className="flex-1 shrink gap-2.5 rounded-lg p-3 hover:bg-white/10 bg-white/5 text-white cursor-pointer h-auto border border-white/10 text-xs"
        >
          Admin Sandbox
        </Button>
      </div>
    </div>
  );
};

export default SocialSignUp;
