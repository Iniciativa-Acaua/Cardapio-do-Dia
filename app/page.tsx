// app/page.tsx
import HeroHome from "@/components/HeroHome";
import Categories from "@/components/home/Categories";
import ProductGrid from "@/components/produto/ProductGrid";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import LocationHours from "@/components/home/LocationHours";
import CallToAction from "@/components/home/CallToAction";

export default function Home() {
  return (
    <>
      <HeroHome />
      <Categories />
      <ProductGrid />
      <HowItWorks />
      <Testimonials />
      <LocationHours />
      <CallToAction />
    </>
  );
}