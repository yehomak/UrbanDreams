// src/pages/RoadmapPage/RoadmapPage.tsx
import { UrbanLayout } from '@/components/UrbanLayout';

const phases = [
  {
    title: "🌱 Phase 1: Foundations",
    status: "Current Stage",
    sticker: "Q1 2025",
    achievements: [
      "✅ Core Tech: Style-transfer AI trained on 10+ PD artists",
      "✅ Blockchain: Smart contracts deployed (GetGems/TON)",
      "✅ TMA: Develop Telegram mini-app with map protytype (clickable NFT locations)"
    ],
    nextSteps: [
      "🖼️ WarsawStyle Alpha Drop (3 free NFTs for beta testers)"
    ],
    color: "#6ab3f3"
  },
  {
    title: "🚀 Phase 2: Grow Community",
    status: "Soon",
    sticker: "Q2 2025",
    achievements: [
      "🎨 Style Voting: Holders pick next artist (e.g., Van Gogh vs. Malevich)",
      "📍 Geo-Drops: Mint NFTs at real-world landmarks via TMA",
      "🤖 AI Lab: Upload photos to apply curated styles (beta)"
    ],
    goal: "1,000 active collectors",
    color: "#a162e8"
  },
  {
    title: "💰 Phase 3: Monetize",
    status: "",
    sticker: "Q3 2025",
    achievements: [
      "💎 Premium Drops: Rare NFTs at historic sites",
      "🖨️ Physical AR Prints: NFC-linked to NFTs",
      "🏆 Token Rewards: Staking for exclusive content"
    ],
    goal: "5,000 NFTs sold (0.2 TON avg.)",
    color: "#f09383"
  },
  {
    title: "🌍 Phase 4: Expand",
    status: "",
    sticker: "Q4 2025+",
    achievements: [
      "🌐 City DAOs: Local communities govern their urban art",
      "🏛️ IRL Exhibits: Pop-up galleries in abandoned buildings",
      "🎮 Metaverse Gallery: 3D showcase on TON"
    ],
    goal: "",
    color: "#6dd0a5"
  }
];

export function RoadmapPage() {
  return (
    <UrbanLayout allowScroll={true}>
      <div style={{
        padding: '1.5rem',
        maxWidth: '800px',
        margin: '20% auto',
        color: '#f5f5f5'
      }}>
        {phases.map((phase, index) => (
          <div key={index} style={{
            backgroundColor: '#232e3c',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            position: 'relative',
            borderLeft: `4px solid ${phase.color}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            {/* Sticker with date */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '20px',
              backgroundColor: phase.color,
              color: '#17212b',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {phase.sticker}
            </div>

            <h3 style={{
              marginTop: '0',
              marginBottom: '0.5rem',
              fontSize: '1.4rem',
              color: phase.color
            }}>
              {phase.title}
            </h3>

            {phase.status && (
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
            )}

            <ul style={{
              margin: '1rem 0',
              paddingLeft: '1.5rem',
              listStyleType: 'none'
            }}>
              {phase.achievements.map((item, i) => (
                <li key={i} style={{
                  marginBottom: '0.5rem',
                  position: 'relative',
                  paddingLeft: '1.5rem'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
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
                  margin: '0 0 0.5rem 0',
                  fontSize: '1rem',
                  color: '#a1a1a1'
                }}>
                  Next Up:
                </h4>
                <ul style={{
                  margin: '0',
                  paddingLeft: '1.5rem',
                  listStyleType: 'none'
                }}>
                  {phase.nextSteps.map((item, i) => (
                    <li key={i} style={{
                      marginBottom: '0.5rem',
                      position: 'relative',
                      paddingLeft: '1.5rem'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        fontSize: '1.1rem'
                      }}>
                        {item.match(/^[^\s]+/)?.[0]}
                      </span>
                      {item.replace(/^[^\s]+\s/, '')}
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