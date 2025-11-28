import React from 'react'
import Header from '../layouts/header'
import Footer from '../layouts/footer'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
