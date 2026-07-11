import HomeHero from "@/components/home/HomeHero";

export default function Home() {
  const stats = [
    { value: "20+", label: "Countries Exported To" },
    { value: "4", label: "Premium SKU Lines" },
    { value: "24/7", label: "Service & Support" },
  ];

  const grainCards = [
    {
      id: "ls",
      title: "LS — Lot Sale",
      subtitle: "थोक / लॉट में बिक्री",
      description:
        "LS matlab Lot Sale — jab aap poori lot ya bade quantity mein basmati khareedte hain. Distributors, exporters, hotels aur wholesale buyers ke liye yeh model best hai. Saifco LS mein fixed lot size, competitive rate, saaf grading aur time par delivery milti hai.",
      tagline: "बड़े ऑर्डर और थोक खरीद के लिए",
      image: "/download.jpg",
      reverse: false,
    },
    {
      id: "lp",
      title: "LP — Loose Purchase",
      subtitle: "लॉट में खरीदारी",
      description:
        "LP matlab Lot Purchase — ek hi lot mein alag-alag SKU ya variant select karke bulk mein order dena. Retailers aur dealers jo ek saath zyada maatra mein stock lena chahte hain, unke liye yeh system aasan aur clear hai.",
      tagline: "डीलर और रिटेलर के लिए आसान लॉट ऑर्डर",
      image: "/lotPurchase.jpg",
      reverse: true,
    },
    {
      id: "cp",
      title: "CP — Consumer Pack",
      subtitle: "छोटी पैकिंग — घर और दुकान के लिए",
      description:
        "CP matlab Consumer Pack — chhoti aur ready-to-sell packing jaise 1 kg, 5 kg wagairah. Saifco CP mein achhi printing, saaf packing aur har pack par same quality guarantee — dukaan aur household buyers dono ke liye.",
      tagline: "रिटेल और घरेलू उपयोग के लिए तैयार पैक",
      image: "/Consumer Pack.webp",
      reverse: false,
    },
  ];

  return <HomeHero stats={stats} grainCards={grainCards} />;
}