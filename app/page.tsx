import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/layout/HeroSection'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { CtaBanner } from '@/components/home/CtaBanner'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <WhyChooseUs />
      <CtaBanner />
      <Footer />
    </main>
  )
}
