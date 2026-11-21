import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";

const Platform = () => {
  return (
    <section className="md:pt-40 sm:pt-24 pt-12 relative z-1">
      <div className="container px-4">
        <div className="bg-white/5 px-8 md:px-16 py-14 rounded-3xl border border-white/10 grid grid-cols-12 items-center relative overflow-hidden backdrop-blur-md">
          <div className="lg:col-span-8 col-span-12">
            <div className="flex items-center gap-2 text-primary font-mono text-sm mb-3">
              <Terminal className="w-4 h-4" /> Native Python SDK & MCP Server Gateway
            </div>
            <h2 className="text-white sm:text-[40px] text-3xl font-bold mb-4 tracking-tight">
              Plug-and-Play Security for Agent Swarms
            </h2>
            <p className="text-muted/80 text-lg leading-relaxed">
              Wrap your existing LangChain, CrewAI, AutoGen, or custom autonomous agents in 3 lines of code.
              Includes a complete Model Context Protocol (MCP) proxy for tool policy enforcement.
            </p>
          </div>
          <div className="lg:col-span-4 col-span-12">
            <div className="flex lg:justify-end lg:mt-0 mt-7 justify-start gap-4">
              <Button
                asChild
                className="flex items-center gap-2 text-black bg-primary hover:bg-primary/90 py-6 px-6 rounded-lg text-base font-semibold h-12"
              >
                <Link href="/documentation">
                  Developer Docs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;
