import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/layout/HeroSection'
import { Footer } from '@/components/layout/Footer'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { CtaBanner } from '@/components/home/CtaBanner'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturedCategories />
        <WhyChooseUs />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
