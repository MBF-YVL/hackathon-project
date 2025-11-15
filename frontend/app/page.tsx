/**
 * Landing page for CityPulse Montréal 2035
 * Beautiful futuristic landing page explaining the project
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PillBase } from '@/components/ui/3d-adaptive-navigation-bar';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { GlowCard } from '@/components/ui/spotlight-card';
import { Button } from '@/components/ui/button';
import MapPreview from '@/components/MapPreview';
import { Map, Brain, BarChart3, TreePine, Car, Bus, Sparkles, Target, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <PillBase />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-black to-black" />
          <div className="absolute inset-0">
            {Array.from({ length: 36 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-6"
            >
              <Sparkles className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6 tracking-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500">
                CityPulse
              </span>
              <span className="block text-white mt-2">Montréal 2035</span>
            </h1>

            <p className="text-xl sm:text-2xl md:text-3xl text-cyan-200/80 mb-8 font-light">
              A real-time urban stress digital twin for the cities of tomorrow
            </p>

            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Built for <span className="text-cyan-400 font-semibold">Champlain Code Quest 2025</span> • 
              Theme: <span className="text-cyan-400 font-semibold">"Build the World of Tomorrow"</span>
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/map">
                <Button
                  size="lg"
                  className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all"
                >
                  Explore the Map
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg rounded-full"
                onClick={() => {
                  document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-32 px-4 md:px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                The Challenge
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              By 2035, cities will face unprecedented challenges that require smarter planning tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Target,
                title: 'Climate Emergencies',
                description: 'Rising temperatures, extreme weather, and urban heat islands demand rapid response capabilities.',
              },
              {
                icon: BarChart3,
                title: 'Limited Resources',
                description: 'City planners need to prioritize interventions with maximum impact on limited budgets.',
              },
              {
                icon: TreePine,
                title: 'Equity & Vulnerability',
                description: 'Ensuring the most vulnerable communities receive help first requires data-driven insights.',
              },
              {
                icon: Brain,
                title: 'Fragmented Data',
                description: 'Current tools show air quality here, traffic there—no unified view of urban stress.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel p-8 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
              >
                <item.icon className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-32 px-4 md:px-6 relative bg-gradient-to-b from-black via-cyan-950/10 to-black">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                Our Solution
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              CityPulse Montréal 2035 is a prototype of the planning tools cities will use in 2035
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-6xl font-bold text-cyan-400 mb-2">21,574</div>
              <div className="text-gray-400">Grid Cells</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-6xl font-bold text-cyan-400 mb-2">6</div>
              <div className="text-gray-400">Stress Factors</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-6xl font-bold text-cyan-400 mb-2">9</div>
              <div className="text-gray-400">Data Sources</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 md:p-12 rounded-2xl border border-cyan-500/30"
          >
            <h3 className="text-3xl font-bold mb-6 text-cyan-400">City Stress Index (CSI)</h3>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              We created a unified <strong className="text-cyan-400">City Stress Index</strong> that combines six critical factors into a single score from 0 to 100:
            </p>
            <ul className="grid md:grid-cols-2 gap-4 text-gray-400">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                Air pollution from 11 monitoring stations
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                Urban heat islands
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                Noise levels (550,000+ measurements)
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                Traffic congestion
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                Transit access & crowding
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                Social vulnerability
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 md:px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                Key Features
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Interactive Stress Map',
                description: 'Real-time visualization of CSI across Montréal with color-coded grid cells from green (low stress) to red (high stress).',
                icon: Map,
              },
              {
                title: 'AI-Powered Insights',
                description: 'Get intelligent explanations of why areas are stressed and receive specific intervention recommendations.',
                icon: Brain,
              },
              {
                title: 'Scenario Modeling',
                description: 'Model different 2035 futures by adjusting car dependence, transit investment, and tree planting levels.',
                icon: BarChart3,
              },
              {
                title: 'Tree Planting Priority',
                description: '388,000+ potential planting sites prioritized by heat stress, air quality, and social vulnerability.',
                icon: TreePine,
              },
              {
                title: 'Car Access Limits',
                description: 'Smart recommendations for school streets, pedestrian zones, and low-traffic areas based on traffic and noise data.',
                icon: Car,
              },
              {
                title: 'Transit Improvements',
                description: 'Identify where new stops, route extensions, or frequency increases will have the most impact.',
                icon: Bus,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlowCard glowColor="cyan" size="md" className="h-full">
                  <div className="flex flex-col h-full">
                    <feature.icon className="w-12 h-12 text-cyan-400 mb-4" />
                    <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed flex-grow">{feature.description}</p>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Preview Section */}
      <section id="map" className="py-32 px-4 md:px-6 relative bg-gradient-to-b from-black via-cyan-950/10 to-black">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                Explore the Digital Twin
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Interactive map showing real-time urban stress across Montréal. Click any cell to see detailed metrics and AI-powered recommendations.
            </p>
          </motion.div>

          <ContainerScroll
            titleComponent={
              <div className="text-center">
                <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  CityPulse Montréal 2035
                </h3>
                <p className="text-gray-400 text-lg">
                  Scroll to explore the interactive map
                </p>
              </div>
            }
          >
            <MapPreview />
          </ContainerScroll>

          <div className="text-center mt-12">
            <Link href="/map">
              <Button
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-cyan-500/50"
              >
                Open Full Map Experience
                <Zap className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About / Hackathon Section */}
      <section id="about" className="py-32 px-4 md:px-6 relative">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                Built for Tomorrow
              </span>
            </h2>
            
            <div className="glass-panel p-8 md:p-12 rounded-2xl border border-cyan-500/30 mb-8">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                <strong className="text-cyan-400">CityPulse Montréal 2035</strong> was created by{' '}
                <strong className="text-cyan-400">Team YVL</strong> for{' '}
                <strong className="text-cyan-400">Champlain Code Quest 2025</strong>, a hackathon with the theme{' '}
                <strong className="text-cyan-400">"Build the World of Tomorrow"</strong>.
              </p>
              
              <div className="mb-6">
                <p className="text-lg text-gray-300 mb-4">
                  <strong className="text-cyan-400">Team Members:</strong>
                </p>
                <ul className="grid md:grid-cols-2 gap-3 text-gray-400">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    Mir Faiyazur Rahman
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    Aarush Patel
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    Amine Baha
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    Tamim Afghanyar
                  </li>
                </ul>
              </div>
              
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                This prototype demonstrates how city planners and operations teams will use AI-powered tools in 2035 to manage urban stress, 
                climate challenges, and equity issues. It's not just a visualization—it's a complete planning system that combines:
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">2.5M+</div>
                  <div className="text-gray-400">Data Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">Real</div>
                  <div className="text-gray-400">Montréal Data</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">AI</div>
                  <div className="text-gray-400">Powered Insights</div>
                </div>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed">
                <strong className="text-cyan-400">Does it feel like something people might use in 2035?</strong>
              </p>
              <p className="text-xl text-cyan-400 font-semibold mt-4">
                Absolutely. This is the future of urban planning.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/map">
                <Button
                  size="lg"
                  className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-cyan-500/50"
                >
                  Start Exploring
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 border-t border-cyan-500/20">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-gray-400 mb-2">
            CityPulse Montréal 2035 • Built by <strong className="text-cyan-400">Team YVL</strong>
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Mir Faiyazur Rahman • Aarush Patel • Amine Baha • Tamim Afghanyar
          </p>
          <p className="text-sm text-gray-500">
            Champlain Code Quest 2025 • "Build the World of Tomorrow"
          </p>
        </div>
      </footer>
    </div>
  );
}
