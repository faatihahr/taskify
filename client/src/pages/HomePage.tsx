import React from 'react'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import Header from '../components/layouts/header'
import Footer from '../components/layouts/footer'

const HomePage: React.FC = () => {
  return (
    <div className="dark bg-auth-gradient min-h-screen flex flex-col relative overflow-hidden">
      <Header />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-element-1"></div>
        <div className="bg-element-2"></div>
      </div>
      <main className="flex-1 relative z-10">
        <HeroSection />
        <FeaturesSection />
      </main>
      <div className="text-white">
        <Footer />
      </div>
    </div>
  )
}

export default HomePage
