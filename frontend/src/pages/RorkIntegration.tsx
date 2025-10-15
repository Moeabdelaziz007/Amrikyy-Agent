import React from 'react';
import { RorkBadge } from '../components/RorkBadge';
import './RorkIntegration.css';

export const RorkIntegration: React.FC = () => {
  return (
    <div className="rork-integration-page">
      <div className="rork-hero">
        <h1 className="rork-title">
          Built with <span className="rork-highlight">Rork</span>
        </h1>
        <p className="rork-subtitle">
          Professional iOS App Development Platform
        </p>
        <RorkBadge variant="detailed" />
      </div>

      <div className="rork-content">
        <section className="rork-section">
          <h2>🎯 What is Rork?</h2>
          <p>
            <strong>Rork</strong> is a professional iOS app development platform that helps developers 
            build high-quality mobile applications with topology-based architecture. It provides 
            tools, frameworks, and best practices for creating scalable, maintainable iOS apps.
          </p>
          <div className="rork-features">
            <div className="rork-feature">
              <span className="feature-icon">🏗️</span>
              <h3>Topology-Based Architecture</h3>
              <p>Strategic arrangement of app components for optimal performance</p>
            </div>
            <div className="rork-feature">
              <span className="feature-icon">⚡</span>
              <h3>High Performance</h3>
              <p>Optimized for speed and efficiency on iOS devices</p>
            </div>
            <div className="rork-feature">
              <span className="feature-icon">📱</span>
              <h3>Native iOS Development</h3>
              <p>Built specifically for iOS with Swift and SwiftUI</p>
            </div>
            <div className="rork-feature">
              <span className="feature-icon">🔧</span>
              <h3>Professional Tools</h3>
              <p>Complete toolkit for modern iOS app development</p>
            </div>
          </div>
        </section>

        <section className="rork-section">
          <h2>🚀 How Amrikyy Uses Rork</h2>
          <div className="rork-architecture">
            <div className="architecture-layer">
              <h3>iOS Native App</h3>
              <p>Built with Rork's topology-based architecture</p>
              <ul>
                <li>MVVM architecture pattern</li>
                <li>SwiftUI for modern UI</li>
                <li>Combine for reactive programming</li>
                <li>Optimized performance</li>
              </ul>
            </div>
            <div className="architecture-arrow">↓</div>
            <div className="architecture-layer">
              <h3>Backend API</h3>
              <p>Express.js with star topology</p>
              <ul>
                <li>RESTful API design</li>
                <li>Real-time updates</li>
                <li>Secure authentication</li>
                <li>Scalable infrastructure</li>
              </ul>
            </div>
            <div className="architecture-arrow">↓</div>
            <div className="architecture-layer">
              <h3>AI Layer</h3>
              <p>Gemini AI with mesh topology</p>
              <ul>
                <li>Natural language processing</li>
                <li>Intelligent recommendations</li>
                <li>Multi-agent collaboration</li>
                <li>Context-aware responses</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rork-section">
          <h2>📊 Topology Benefits</h2>
          <div className="rork-benefits">
            <div className="benefit-card">
              <div className="benefit-metric">2-5x</div>
              <div className="benefit-label">Faster Performance</div>
              <p>Optimized data flow and component interaction</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-metric">10x</div>
              <div className="benefit-label">Better Scalability</div>
              <p>Strategic resource allocation and growth</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-metric">99.9%</div>
              <div className="benefit-label">Uptime</div>
              <p>Reliable architecture with no single point of failure</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-metric">50%</div>
              <div className="benefit-label">Fewer Bugs</div>
              <p>Clear component boundaries and separation</p>
            </div>
          </div>
        </section>

        <section className="rork-section">
          <h2>🎨 Design Principles</h2>
          <div className="rork-principles">
            <div className="principle">
              <h3>1. Layered Architecture</h3>
              <p>Clear separation between UI, business logic, and data layers</p>
            </div>
            <div className="principle">
              <h3>2. Component Topology</h3>
              <p>Strategic arrangement of components for optimal communication</p>
            </div>
            <div className="principle">
              <h3>3. Service Mesh</h3>
              <p>Efficient service-to-service communication patterns</p>
            </div>
            <div className="principle">
              <h3>4. Team Topology</h3>
              <p>Organized development teams based on component ownership</p>
            </div>
          </div>
        </section>

        <section className="rork-section rork-cta">
          <h2>🌟 Learn More About Rork</h2>
          <p>
            Discover how Rork can help you build professional iOS applications 
            with topology-based architecture.
          </p>
          <div className="rork-cta-buttons">
            <a 
              href="https://rork.com/p/be15ei0flq1ln8v3yawa7"
              target="_blank"
              rel="noopener noreferrer"
              className="rork-cta-button primary"
            >
              Visit Rork Profile →
            </a>
            <a 
              href="https://rork.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rork-cta-button secondary"
            >
              Explore Rork Platform
            </a>
          </div>
        </section>

        <section className="rork-section">
          <h2>💡 Why Choose Rork?</h2>
          <div className="rork-reasons">
            <div className="reason">
              <span className="reason-icon">✅</span>
              <div>
                <h4>Professional Development</h4>
                <p>Industry-standard tools and practices for iOS development</p>
              </div>
            </div>
            <div className="reason">
              <span className="reason-icon">✅</span>
              <div>
                <h4>Scalable Architecture</h4>
                <p>Built to grow with your app from MVP to enterprise</p>
              </div>
            </div>
            <div className="reason">
              <span className="reason-icon">✅</span>
              <div>
                <h4>Performance Optimized</h4>
                <p>Fast, efficient, and responsive on all iOS devices</p>
              </div>
            </div>
            <div className="reason">
              <span className="reason-icon">✅</span>
              <div>
                <h4>Maintainable Code</h4>
                <p>Clean architecture that's easy to understand and modify</p>
              </div>
            </div>
            <div className="reason">
              <span className="reason-icon">✅</span>
              <div>
                <h4>Best Practices</h4>
                <p>Following Apple's guidelines and industry standards</p>
              </div>
            </div>
            <div className="reason">
              <span className="reason-icon">✅</span>
              <div>
                <h4>Future-Proof</h4>
                <p>Modern architecture ready for new iOS features</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="rork-footer">
        <RorkBadge variant="minimal" />
        <p>Amrikyy Travel Agent - Built with Rork Topology</p>
      </footer>
    </div>
  );
};

export default RorkIntegration;
