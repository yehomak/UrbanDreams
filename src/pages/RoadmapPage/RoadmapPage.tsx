// src/pages/DreamJourneyPage/DreamJourneyPage.tsx
import { UrbanLayout } from '@/components/UrbanLayout';

const journey = [
  {
    phase: "The Awakening",
    period: "Q1 2025",
    status: "dreaming",
    theme: "#B069DB", // purple dream
    items: [
      "🌌 The vision came - urban dreams waiting to be captured",
      "🖌️ First style transfer experiments - watching cities breathe anew",
      "🗺️ Map conception - making dreams navigable",
      "✨ Warsaw chosen - where old souls meet new visions",
      "🤖 ML pipeline born - teaching algorithms to dream"
    ],
    vibe: "The first whisper of urban poetry"
  },
  {
    phase: "First Dreams",
    period: "Now • Q2 2025",
    status: "living",
    theme: "#4CAF50", // green growth
    items: [
      "🎨 10 dream fragments captured (11/100)",
      "📱 Dream window created - TMA v1 live",
      "🌃 Daily art insights - sharing the dream language",
      "🤝 First dreamers joining the journey",
      "💫 Testing reality - mainnet deployment"
    ],
    progress: "20% dreamt",
    vibe: "Dreams taking their first breath"
  },
  {
    phase: "Dreamweavers Guild",
    period: "Q3 2025",
    status: "building", 
    theme: "#2196F3", // blue community
    items: [
      "👥 Holders chat opening - dreamers unite",
      "🗳️ Collective dreaming begins - voting system",
      "🎁 Treasury awakening - shared dream value",
      "📚 Story archive growing - 50+ urban tales",
      "🛍️ Dream marketplace flourishing"
    ],
    vibe: "Where individual dreams become collective vision"
  },
  {
    phase: "City of Dreams", 
    period: "Q4 2025",
    status: "expanding",
    theme: "#FF9800", // orange expansion
    items: [
      "🏙️ New city horizons - dreams spreading beyond Warsaw",
      "🎪 IRL dream gatherings - walking the dream map",
      "🛠️ Dream forge - create-your-own style tool",
      "📸 AR dream viewer - overlaying visions on reality",
      "🌍 500+ dreamers in our constellation"
    ],
    vibe: "The dream becomes tangible"
  },
  {
    phase: "Eternal Dream",
    period: "2026 & Beyond", 
    status: "evolving",
    theme: "#9C27B0", // purple eternal
    items: [
      "🏛️ Dream DAO born - community governance",
      "🎨 Artist collaborations - expanding the dream palette",
      "🌐 Multi-city dream network",
      "📖 Urban Dream Archive - preserving city souls",
      "💞 Self-sustaining dream ecosystem"
    ],
    vibe: "The dream lives and breathes on its own"
  }
];

const manifesto = {
  title: "Manifesto",
  principles: [
    {
      icon: "📍",
      title: "Place Has Soul",
      text: "Every coordinate tells a story. We listen to what the streets whisper."
    },
    {
      icon: "🎨", 
      title: "History Is Our Palette",
      text: "Old masters live again through new urban visions. We honor, we reinterpret."
    },
    {
      icon: "🌐",
      title: "Access Is Sacred", 
      text: "Discovery should feel like a midnight walk - open, mysterious, welcoming."
    },
    {
      icon: "💫",
      title: "Dreams Grow Together",
      text: "Individual visions become collective consciousness. We dream louder together."
    }
  ]
};

export function RoadmapPage() {
  return (
    <UrbanLayout allowScroll={true}>
      <div style={{
        padding: '1rem',
        color: '#f5f5f5',
        background: 'linear-gradient(180deg, #1a1f2e 0%, #232e3c 50%, #1a1f2e 100%)',
        minHeight: '100vh'
      }}>

        {/* Manifesto */}
        <div style={{
          maxWidth: '600px',
          margin: '7rem auto',
          padding: '2rem',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{
            textAlign: 'center',
            marginTop: 0,
            marginBottom: '2rem',
            fontSize: '2.5rem',
            fontWeight: 400,
            color: "#d8d8d8",
            fontFamily: 'sans-serif'
          }}>
            {manifesto.title}
          </h2>
          <div style={{
            display: 'grid',
            gap: '1.5rem'
          }}>
            {manifesto.principles.map((principle, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  fontSize: '2rem',
                  opacity: 0.8
                }}>
                  {principle.icon}
                </div>
                <div>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    color: '#4CAF50',
                    fontSize: '1.1rem'
                  }}>
                    {principle.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    opacity: 0.8,
                    lineHeight: 1.5,
                    fontSize: '0.95rem'
                  }}>
                    {principle.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Timeline */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 4rem',
          position: 'relative'
        }}>
          {/* Dream Line */}
          <div style={{
            position: 'absolute',
            left: '30px',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'linear-gradient(180deg, #B069DB, #4CAF50, #2196F3, #FF9800, #9C27B0)',
            opacity: 0.3
          }}></div>

          {journey.map((stage, index) => (
            <div key={index} style={{
              position: 'relative',
              marginBottom: '4rem',
              marginLeft: '60px'
            }}>
              {/* Dream Orb */}
              <div style={{
                position: 'absolute',
                left: '-45px',
                top: '0',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: stage.theme,
                border: `3px solid ${stage.theme}20`,
                boxShadow: `0 0 20px ${stage.theme}40`
              }}></div>

              {/* Phase Card */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: `1px solid ${stage.theme}30`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Glow effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${stage.theme}, transparent)`
                }}></div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <h3 style={{
                    margin: 0,
                    color: stage.theme,
                    fontSize: '1.3rem',
                    fontWeight: 400
                  }}>
                    {stage.phase}
                  </h3>
                  <div style={{
                    background: stage.theme,
                    color: '#1a1f2e',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {stage.period}
                  </div>
                </div>

                {/* Status */}
                {/* <div style={{
                  display: 'inline-block',
                  background: `${stage.theme}20`,
                  color: stage.theme,
                  padding: '0.3rem 0.8rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  border: `1px solid ${stage.theme}30`,
                  textTransform: 'capitalize'
                }}>
                  {stage.status}
                </div> */}

                {/* Progress */}
                {stage.progress && (
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}>
                    {stage.progress}
                  </div>
                )}

                {/* Items */}
                <ul style={{
                  margin: '1rem 0 0 0',
                  padding: 0,
                  listStyle: 'none'
                }}>
                  {stage.items.map((item, i) => (
                    <li key={i} style={{
                      padding: '0.7rem 0',
                      borderBottom: i < stage.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      color: '#d8d8d8',
                      fontSize: '1.1rem',
                      lineHeight: 1.4,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem'
                    }}>
                      <span style={{ opacity: 0.6 }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Vibe */}
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px dashed rgba(255,255,255,0.1)',
                  fontStyle: 'italic',
                  opacity: 0.7,
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}>
                  {stage.vibe}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          opacity: 0.8
        }}>
          <p style={{ marginBottom: '1rem', fontSize: '1.1rem', fontFamily: 'Cursive' }}>
            Urban dreams whisper promises of success, yet the true escape lies in the quiet embracing of horizons.
          </p>
          <div style={{ fontSize: '2rem', opacity: 0.6 }}>
            🌙 🏙️ ✨
          </div>
        </div>
      </div>
    </UrbanLayout>
  );
}