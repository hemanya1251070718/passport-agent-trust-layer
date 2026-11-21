import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { pricedata } from "@/app/api/data";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const CardSlider = () => {
  const settings = {
    autoplay: true,
    dots: false,
    arrows: false,
    infinite: true,
    autoplaySpeed: 2000,
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 1,
    cssEase: "ease-in-out",
    responsive: [
      {
        breakpoint: 479,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
    ],
  };

  return (
    <div className="pt-14 flex flex-col gap-10">
      <div className="flex flex-col gap-3 items-center justify-center text-center">
        <p className="text-white font-medium">
          Zero-Trust <span className="text-primary">Security Guardrails</span>
        </p>
        <h2 className="sm:text-5xl text-3xl text-white font-medium">
          Multi-Layer Agent Protection Suite
        </h2>
      </div>

      <Slider {...settings}>
        {pricedata.map((item, index) => (
          <div key={index} className="pr-6">
            <Card className="bg-white/5 border border-white/10 shadow-none rounded-xl p-0 hover:border-primary/50 transition-all duration-300">
              <CardContent className="px-5 py-6">
                <div className="flex flex-col items-center gap-5">
                  <div
                    className={`${item.background} ${item.padding} rounded-full`}
                  >
                    <Image
                      src={item.icon}
                      alt={`${item.title} icon`}
                      width={item.width}
                      height={item.height}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-base font-semibold leading-snug">
                      {item.title}
                    </p>
                    <p className="text-primary text-xs font-mono mt-1">
                      {item.short}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center mt-3 pt-3 border-t border-white/5">
                  <p className="text-lg font-bold text-white mb-0 leading-none">
                    {item.price}
                  </p>
                  <p className="text-xs text-white/50 mt-1 font-mono">
                    {item.mark}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CardSlider;
