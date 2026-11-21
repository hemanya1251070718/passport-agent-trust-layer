import { upgradeData } from "@/app/api/data";
import Image from "next/image";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const Upgrade = () => {
  return (
    <section className="py-24" id="upgrade">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" /> Hardened Against Adversarial Vectors
            </div>
            <h2 className="text-white sm:text-5xl text-3xl font-bold mb-4 tracking-tight leading-tight">
              Enterprise Control for Autonomous AI Swarms
            </h2>
            <p className="text-muted/80 text-lg mb-8 leading-relaxed">
              Tested against prompt injections, SSRF payloads, privilege escalation, and runaway financial burn.
              Passport is the bulletproof trust harness for production agent deployments.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {upgradeData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <h3 className="text-sm text-white/90 font-medium">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="ml-0 lg:ml-7 justify-self-center">
              <Image
                src="/images/upgrade/img-upgrade.png"
                alt="Passport Enterprise Shield"
                width={625}
                height={580}
                className="rounded-2xl border border-white/10 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Upgrade;
