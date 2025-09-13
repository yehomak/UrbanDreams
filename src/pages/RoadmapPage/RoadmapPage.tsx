// src/pages/RoadmapPage/RoadmapPage.tsx
import { UrbanLayout } from '@/components/UrbanLayout';


const phases = [
  {
    title: "🌱 Phase 0: Concept & Prototype",
    status: "Completed",
    sticker: "Q4 2024",
    achievements: [
      "✅ Concept & ML Model Selected (VGG-19)",
      "✅ Style Transfer Pipeline Built",
      "✅ Initial Test Assets Created (3/100 photos, 3/10 styles)",
      "✅ TON Smart Contracts Deployed on Testnet",
      "✅ Telegram Mini App (TMA) Core Developed",
      "✅ Official Telegram Channel Created",
      "✅ Collection Branding (Title, Avatar, Banner)"
    ],
    nextSteps: ["Proceed to the 1st Batch Launch"],
    color: "#4cab4e" // green
  },
  {
    title: "🚀 Phase 1: Limited Launch (Genesis Drop)",
    status: "Current Stage",
    sticker: "Q1 2025",
    achievements: [
      "✅ Collection Metadata & Description Finalized",
      "✅ Item Data Preparation Started",
      "✔️ Generate & Finalize NFT Descriptions (LLM/Manual)",
      "✔️ IPFS Hosting Testing & Stability Check",
      "✔️ Deploy First 5-10 Items to Testnet",
      "✔️ Test Sales Process & Edge Cases",
      "✔️ Regular Channel Posts & Art Insights"
    ],
    nextSteps: [
      "Complete metadata for Genesis drop",
      "Finalize and test minting process",
      "Launch Genesis allowlist mint"
    ],
    color: "#f59e0b" // amber
  },
  {
    title: "📈 Phase 2: Grow & Scale",
    status: "Upcoming",
    sticker: "Q2 2025",
    achievements: [
      "✔️ Scale Asset Creation (100+ photos, 10+ styles)",
      "✔️ Deploy Full Collection to Mainnet",
      "✔️ Launch Public Minting",
      "✔️ Integrate Secondary Market (Getgems/Disintar)",
      "✔️ Implement Holder Chat & VIP Group",
      "✔️ Early Access & Whitelist Programs"
    ],
    nextSteps: [
      "Community growth campaigns",
      "Collaborations with TON influencers"
    ],
    color: "#3b82f6" // blue
  },
  {
    title: "✨ Phase 3: Enhance & Expand",
    status: "Future",
    sticker: "H2 2025",
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
    color: "#8b5cf6" // purple
  }
];

export function RoadmapPage() {
  return (
    <UrbanLayout allowScroll={true}>
      <div style={{
        padding: '2rem',
        maxWidth: '600px',
        margin: '35% auto',
        color: '#f5f5f5'
      }}>
        {phases.map((phase, index) => (
          <div key={index} style={{
            backgroundColor: '#232e3c',
            borderRadius: '16px',
            padding: '2.5rem 1.5rem',
            marginBottom: '3rem',
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
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: `1px dashed ${phase.color}`
              }}>
                <h4 style={{
                  margin: '0 0 0.5rem 1rem',
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
                      marginBottom: '0.5rem',
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