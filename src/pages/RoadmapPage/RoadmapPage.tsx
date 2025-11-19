// src/pages/RoadmapPage/RoadmapPage.tsx
import { UrbanLayout } from '@/components/UrbanLayout';


const phases = [
  {
    title: "🌱 Phase 0: Concept Core",
    status: "Completed",
    sticker: "Q1-Q2 2025",
    achievements: [
      //"✅ Develop Project Concept",
      "✅ Concept & Tech Foundation",
      //"✅ Build ML Style Transfer Pipeline",
      //"✅ Prepare Collection Branding & Metadata",
      //"✅ Set up Project infrastructure",
      "✅ Collection Deploy on Testnet",
      "✅ Telegram Mini App v1",
      "✅ Official Telegram Channel",
      "✅ The Warsaw 10: Build and Deploy 10 NFTs on Mainnet",
    ],
    nextSteps: ["Collection Growth & Public Engagement"],
    color: "#4cab4e" // green
  },
  {
    title: "🚀 Phase 1: Steady Development",
    status: "Current Stage",
    sticker: "Q3-Q4 2025",
    achievements: [
      "✅ Regular Channel Posts & Art Insights",
      "✅ Deploy Collection & First Item on Mainnet",
      "⏳ Accumulate Collection Items (10/50) 20%",
      "⏳ Art Insights (10/50) 20%",
    ],
    nextSteps: [
      "TMA Community Features",
      "Holders Chat"
    ],
    color: "#B069DB" // amber
  },
  {
    title: "📈 Phase 2: Grow & Scale",
    status: "Upcoming",
    sticker: "Q3-Q4 2025",
    achievements: [
      "✔️ 100+ Items Deployed (99+ photos, 10+ styles)",
      "✔️ 50+ Unique Holders",
      "✔️ 500+ Channel Subscribers",
      "✔️ Launch Public OFFline Minting",
      "✔️ Early Access & Whitelist Programs"
    ],
    nextSteps: [
      "Community growth campaigns",
      "Collaborations with TON influencers"
    ],
    color: "#3b82f6" // purple
  },
  {
    title: "✨ Phase 3: Enhance & Expand",
    status: "Future",
    sticker: "Q1 2026",
    achievements: [
      "✔️ Advanced TMA Features (Profiles, Sharing)",
      "✔️ 'Create Your Own' Style Tool R&D",
      "✔️ AR Viewing Feature",
      "✔️ IRL Events / Physical Print Redemption",
      "✔️ Artist Collaborations"
    ],
    nextSteps: [
      "Explore expansion to new cities",
      "DAO & Community Governance R&D"
    ],
    color: "#94FAF0" // cyan
  }
];

export function RoadmapPage() {
  return (
    <UrbanLayout allowScroll={true}>
      <div style={{
        padding: '2rem',
        maxWidth: '600px',
        margin: '20% auto',
        color: '#f5f5f5'
      }}>
        {phases.map((phase, index) => (
          <div key={index} style={{
            backgroundColor: '#232e3c',
            borderRadius: '16px',
            padding: '1.5rem 1.5rem',
            marginBottom: '5rem',
            position: 'relative',
            borderLeft: `5px solid ${phase.color}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            {/* Sticker with date */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '20px',
              backgroundColor: phase.color,
              color: '#17212b',
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              boxShadow: '0 10px 15px rgba(0,0,0,0.3)'
            }}>
              {phase.sticker}
            </div>

            <h3 style={{
              marginTop: '0',
              marginBottom: '0.5rem',
              fontSize: '1.5rem',
              color: phase.color
            }}>
              {phase.title}
            </h3>

            {/* {phase.status && (
              <div style={{
                display: 'inline-block',
                backgroundColor: 'rgba(106, 179, 243, 0.1)',
                color: '#6ab3f3',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                {phase.status}
              </div>
            )} */}

            <ul style={{
              marginTop: '2rem',
              marginBottom: '1.5rem',
              color: '#d8d8d8',
              paddingLeft: '1.5rem',
              listStyleType: 'none'
            }}>
              {phase.achievements.map((item, i) => (
                <li key={i} style={{
                  marginBottom: '1.7rem',
                  position: 'relative',
                  paddingLeft: '1.5rem',
                  fontSize: '1.1rem'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '-0.5rem',
                    fontSize: '1.1rem'
                  }}>
                    {item.match(/^[^\s]+/)?.[0]}
                  </span>
                  {item.replace(/^[^\s]+\s/, '')}
                </li>
              ))}
            </ul>

            {phase.nextSteps && (
              <div style={{
                marginTop: '2rem',
                paddingTop: '1.2rem',
                borderTop: `1px dashed ${phase.color}`
              }}>
                <h4 style={{
                  margin: '0.5 0 0.5rem 1rem',
                  fontSize: '1rem',
                }}>
                  Next Up:
                </h4>
                <ul style={{
                  margin: '0',
                  width: '100%',
                  paddingLeft: '1.5rem',
                  listStyleType: 'none'
                }}>
                  {phase.nextSteps.map((item, i) => (
                    <li key={i} style={{
                      marginBottom: '1rem',
                      position: 'relative',
                      paddingLeft: '1rem'
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {phase.goal && (
              <div style={{
                marginTop: '1rem',
                textAlign: 'right',
                fontSize: '0.9rem',
                color: '#a1a1a1'
              }}>
                Goal: {phase.goal}
              </div>
            )}
          </div>
        ))}

      </div>
    </UrbanLayout>
  );
}