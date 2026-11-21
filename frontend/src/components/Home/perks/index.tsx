import { perksData } from "@/app/api/data";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const Perks = () => {
  return (
    <section className="pb-28 relative">
      <div className="container px-4 relative z-2">
        <div className="text-center">
          <div className="flex flex-col gap-4">
            <p className="text-primary font-semibold text-base uppercase tracking-wider">
              Cryptographic Non-Repudiation
            </p>
            <h2 className="text-white sm:text-5xl text-3xl font-bold tracking-tight">
              Enterprise-Grade Control Guarantees
            </h2>
          </div>
          <div className="mt-16 border border-border grid lg:grid-cols-3 sm:grid-cols-2 py-16 gap-10 px-10 md:px-20 rounded-3xl sm:bg-perk bg-dark_grey/35 lg:bg-bottom bg-center bg-no-repeat">
            {perksData.map((item, index) => (
              <Card
                key={index}
                className="text-center flex items-center justify-end flex-col bg-transparent border-none shadow-none ring-0 p-0"
              >
                <CardContent className="p-0 flex flex-col items-center justify-end">
                  <div className="bg-primary/25 backdrop-blur-xs p-4 rounded-full w-fit mb-4">
                    <Image
                      src={item.icon}
                      alt={item.title}
                      width={44}
                      height={44}
                    />
                  </div>
                  <h3 className={`text-white text-24 font-bold mb-3 ${item.space}`}>
                    {item.title}
                  </h3>
                  <div
                    className="text-muted/80 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/10 sm:w-80 w-96 z-0 sm:h-80 h-96 rounded-full sm:-bottom-80 bottom-0 blur-3xl absolute sm:-left-48 pointer-events-none"></div>
    </section>
  );
};

export default Perks;
