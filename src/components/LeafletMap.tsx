import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "/src/css/leafletmap.css";
import { COLLECTION} from '../constants/collection'
import { ExpandableMenu } from '../components/ExpandableMenu';

import { GetGemsButton } from './GetGemsButton';
import { GoogleMapsButton, GoogleMapsDirectionsButton, generateMapsUrls } from '../components/GoogleMapsButton';
      

// --- Mobile/iOS: CSS var для корректного 100vh ---
function useViewportUnits() {
  useEffect(() => {
    const set = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(document.documentElement);
    window.addEventListener("orientationchange", set, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", set);
    };
  }, []);
}

interface Marker {
  position: [number, number];
  title: string;
  description: string;
  img_src: string;
  emoji: string;
  ipfsHash: string;
  blockchainHash: string;
  nftMetadata?: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | boolean | number;
    }>;
  };
}

const colors = {
  accentText: "#6ab2f2",
  bg: "#17212b",
  button: "#5288c1",
  buttonText: "#ffffff",
  destructive: "#ec3942",
  headerBg: "#17212b",
  hint: "#708499",
  link: "#6ab3f3",
  secondaryBg: "#232e3c",
  sectionHeaderText: "#6ab3f3",
  subtitle: "#708499",
  text: "#f5f5f5",
  light_white: "#f5f5f5",
};

export const LeafletMap: React.FC<{
  center: [number, number];
  zoom?: number;
  markers?: Marker[];
  className?: string;
}> = ({ center, zoom = 13, markers = [], className }) => {
  useViewportUnits();

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);

  const [selected, setSelected] = useState<Marker | null>(null);
  const modalImgHostRef = useRef<HTMLDivElement | null>(null);
  const adoptedImgRef = useRef<HTMLImageElement | null>(null);
  const originalParentRef = useRef<HTMLElement | null>(null);
  const originalNextRef = useRef<Node | null>(null);

  const warsawBounds: L.LatLngBoundsExpression = [
    [52.0969, 20.8510],
    [52.3580, 21.2710],
  ];

  const getIconSizeForZoom = (zoomLevel: number): number => {
    if (zoomLevel >= 16) return 47;     // Extra large - very close
    if (zoomLevel >= 15) return 41;     // Large - close view
    if (zoomLevel >= 14) return 35;     // Medium-large
    if (zoomLevel >= 13) return 28;     // Medium
    if (zoomLevel >= 12) return 24;     // Small-medium
    return 20;                          // Small - far view
  };

  const getRandomVariant = (emoji: string, index: number): string => {
    const emojiCode = emoji.codePointAt(0) || 0;
    const variants = [1, 2, 3, 4, 5];
    const variantIndex = (emojiCode + index) % variants.length;
    return `variant-${variants[variantIndex]}`;
  };

  const createMarkerIcon = (emoji = "📍", index: number, zoomLevel: number = currentZoom) => {
    const variant = getRandomVariant(emoji, index);
    const iconSize = getIconSizeForZoom(zoomLevel);
    const fontSize = Math.max(14, iconSize * 0.6); // Slightly smaller font for better fit
    
    return L.divIcon({
      className: `emoji-marker ${variant}`,
      html: `
        <div style="
          width: ${iconSize}px; 
          height: ${iconSize}px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: ${fontSize}px;
          line-height: 1;
        ">
          ${emoji}
        </div>
      `,
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize / 2],
      popupAnchor: [0, -iconSize / 2],
    });
  };

  const openFromPopupImg = (imgEl: HTMLImageElement, mk: Marker) => {
    originalParentRef.current = imgEl.parentElement as HTMLElement | null;
    originalNextRef.current = imgEl.nextSibling;
    adoptedImgRef.current = imgEl;

    imgEl.classList.add("ll-modal-image");
    imgEl.style.display = "block";
    imgEl.style.margin = "0 auto";

    setSelected(mk);
  };

  useEffect(() => {
    if (!selected || !adoptedImgRef.current || !modalImgHostRef.current) return;
    modalImgHostRef.current.appendChild(adoptedImgRef.current);
    requestAnimationFrame(() => {
      document.querySelector(".ll-modal-reveal")?.classList.add("open");
      adoptedImgRef.current?.classList.add("is-open");
    });
  }, [selected]);

  const closeModal = () => {
    const img = adoptedImgRef.current;
    const parent = originalParentRef.current;
    const next = originalNextRef.current;

    setSelected(null);

    adoptedImgRef.current?.classList.remove("is-open");
    document.querySelector(".ll-modal-reveal")?.classList.remove("open");

    if (img && parent) {
      img.removeAttribute("style");
      if (next) parent.insertBefore(img, next);
      else parent.appendChild(img);
    }
    adoptedImgRef.current = null;
    originalParentRef.current = null;
    originalNextRef.current = null;
  };

  // ---------- Init Map ----------
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    try {
      mapInstance.current = L.map(mapContainer.current, {
        center,
        zoom,
        minZoom: 12,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false,
        touchZoom: true,
        bounceAtZoomLimits: false,
        maxBounds: warsawBounds,
        maxBoundsViscosity: 0.8,
        tapTolerance: 8,
        zoomAnimation: true,
        zoomAnimationThreshold: 8,
        inertia: true,
      });

      // Disable lazy loading for tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        detectRetina: true,
        updateWhenIdle: false, // Load immediately
        updateWhenZooming: true, // Load during zoom
        keepBuffer: 2, // Keep more tiles loaded
        updateInterval: 0, // No delay in updates
      }).addTo(mapInstance.current);

      L.control.zoom({ position: "topright" }).addTo(mapInstance.current as L.Map);

      // Track zoom changes
      mapInstance.current.on('zoomend', () => {
        setCurrentZoom(mapInstance.current!.getZoom());
      });

      return () => {
        mapInstance.current?.remove();
        mapInstance.current = null;
      };
    } catch (err) {
      setError("Failed to initialize map");
      console.error(err);
    }
  }, [center, zoom]);

  // ---------- Update Markers on Zoom Change ----------
  useEffect(() => {
    if (!mapInstance.current || markersRef.current.length === 0) return;

    // Update all existing markers with new size based on current zoom
    markersRef.current.forEach((marker, index) => {
      const emoji = markers[index]?.emoji || "📍";
      const newIcon = createMarkerIcon(emoji, index, currentZoom);
      marker.setIcon(newIcon);
    });
  }, [currentZoom, markers]);

  // Image placeholder with cloud animation
  const ImageWithPlaceholder: React.FC<{ src: string; alt: string; className?: string }> = ({ 
    src, 
    alt, 
    className = "" 
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      setIsLoading(true);
      setHasError(false);
      
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setIsLoading(false);
        setHasError(true);
      };

      // Fallback: if image takes too long, show placeholder
      const timeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setHasError(true);
        }
      }, 3500);

      return () => clearTimeout(timeout);
    }, [src]);

    if (hasError) {
      return (
        <div className={`image-error-placeholder ${className}`}>
          <div className="cloud-placeholder">
            <div className="cloud-animation">
              <div className="cloud-circle large"></div>
              <div className="cloud-circle medium"></div>
              <div className="cloud-circle small"></div>
            </div>
          </div>
          <span className="error-text">Failed to load image</span>
        </div>
      );
    }

    return (
      <div className={`image-container ${className}`}>
        {isLoading && (
          <div className="cloud-placeholder">
            <div className="cloud-animation">
              <div className="cloud-circle large"></div>
              <div className="cloud-circle medium"></div>
              <div className="cloud-circle small"></div>
            </div>
          </div>
        )}
        <img 
          src={src} 
          alt={alt}
          style={{ display: isLoading ? 'none' : 'block' }}
          loading="eager" // Disable lazy loading
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
    );
  };

  // ---------- Render Markers ----------
  useEffect(() => {
    if (!mapInstance.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((mk, index) => {
      const icon = createMarkerIcon(mk.emoji, index, currentZoom);
      const marker = L.marker(mk.position, { icon, keyboard: false }).addTo(mapInstance.current!);

      const popupHtml = `
        <div class="artwork-modern">
          <div class="artwork-modern-img-container">
            <img class="artwork-modern-img js-open-modal" src="${mk.img_src ?? "/404.png"}" alt="${mk.title}"
                 loading="eager" />
          </div>
          <div class="artwork-modern-title">${mk.title ?? "Untitled"}</div>
        </div>
      `;
      marker.bindPopup(popupHtml, { 
        className: "urban-popup-shell", 
        autoPanPadding: [24, 24] 
      });

      marker.on("click", () => {
        const map = mapInstance.current!;
        const target = marker.getLatLng();
        const currentZ = map.getZoom();
        const pt = map.project(target, currentZ);
        const offsetY = 210;
        const offsetX = 8;
        const newCenter = map.unproject(L.point(pt.x + offsetX, pt.y - offsetY), currentZ);
        map.flyTo(newCenter, currentZ, { duration: 1.5, easeLinearity: 0.25 });
      });

      marker.on("popupopen", (e: any) => {
        const popupEl: HTMLElement | null = e?.popup?.getElement?.();
        const img = popupEl?.querySelector(".js-open-modal") as HTMLImageElement | null;
        if (img) {
          img.style.cursor = "zoom-in";
          img.addEventListener("click", () => {
            openFromPopupImg(img, mk);
            if (e?.popup?._source?.closePopup) {
              e.popup._source.closePopup();
            } else {
              mapInstance.current?.closePopup();
            }
          }, { passive: true });
        }
      });

      marker.on("popupclose", () => {
        // Cleanup handled by event listener removal
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [markers]);


  useEffect(() => {
    if (!mapInstance.current || !mapContainer.current) return;

    const cloudCanvas = document.createElement("canvas");
    cloudCanvas.className = "cloud-overlay";
    mapContainer.current.appendChild(cloudCanvas);

    const ctx = cloudCanvas.getContext("2d")!;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const small = window.matchMedia("(max-width: 430px)").matches;
    const CLOUD_COUNT = 25;
    const SPEED_MIN = 7;
    const SPEED_MAX = small ? 25 : 45;
    const SIZE_MIN = small ? 300 : 360;
    const SIZE_MAX = small ? 400 : 550;
    const OPACITY = 0.61;
    const SPRITE_BUCKETS = small ? [200, 260, 320] : [240, 320, 400];

    type Cloud = {
      y: number;
      size: number;
      speed: number;
      sprite: HTMLCanvasElement | OffscreenCanvas;
      phase: number;
    };

    let seed = 1337;
    const rand = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return ((seed >>> 0) % 1_000_000) / 1_000_000;
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const nearest = (n: number, arr: number[]) =>
      arr.reduce((p, c) => (Math.abs(c - n) < Math.abs(p - n) ? c : p), arr[0]);

    const baseImg = new Image();
    baseImg.src = "./base_cloud.png";

    let aspect = 0.67;
    const spriteCache = new Map<number, HTMLCanvasElement | OffscreenCanvas>();

    const makeSprite = (targetSize: number) => {
      const key = targetSize | 0;
      const cached = spriteCache.get(key);
      if (cached) return cached;
      const w = Math.max(1, Math.round(targetSize * DPR));
      const h = Math.max(1, Math.round(targetSize * aspect * DPR));
      const off =
        typeof (window as any).OffscreenCanvas !== "undefined"
          ? new (window as any).OffscreenCanvas(w, h)
          : (() => {
              const c = document.createElement("canvas");
              c.width = w;
              c.height = h;
              return c;
            })();
      const octx = (off as any).getContext("2d") as CanvasRenderingContext2D;
      octx.clearRect(0, 0, w, h);
      octx.drawImage(baseImg, 0, 0, w, h);
      spriteCache.set(key, off);
      return off;
    };

    let clouds: Cloud[] = [];
    let raf = 0;
    let running = true;
    let widthCSS = 0;
    let heightCSS = 0;
    let startTime = 0;

    const resizeCanvas = () => {
      const w = mapContainer.current!.clientWidth;
      const h = mapContainer.current!.clientHeight;
      widthCSS = w;
      heightCSS = h;

      cloudCanvas.width = Math.max(1, Math.round(w * DPR));
      cloudCanvas.height = Math.max(1, Math.round(h * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalAlpha = OPACITY;

      seed = 1337;
      clouds = new Array(CLOUD_COUNT).fill(0).map(() => {
        const size = nearest(lerp(SIZE_MIN, SIZE_MAX, rand()), SPRITE_BUCKETS);
        const speed = lerp(SPEED_MIN, SPEED_MAX, rand());
        const y = Math.round(rand() * Math.max(1, heightCSS - size * aspect));
        const phase = Math.round(rand() * (widthCSS + size)) - size;
        const sprite = makeSprite(size);
        return { y, size, speed, sprite, phase };
      });

      startTime = performance.now();
    };

    let resizeScheduled = false;
    const onResize = () => {
      if (!resizeScheduled) {
        resizeScheduled = true;
        requestAnimationFrame(() => {
          resizeScheduled = false;
          resizeCanvas();
        });
      }
    };

    const frame = (now: number) => {
      if (!running) return;

      if (document.visibilityState !== "visible") {
        raf = requestAnimationFrame(frame);
        return;
      }
      const t = (now - startTime) / 1000;
      ctx.clearRect(0, 0, widthCSS, heightCSS);
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        const total = widthCSS + c.size;
        let x = (c.phase + c.speed * t) % total;
        if (x < 0) x += total;
        x -= c.size;

        const sprite = c.sprite as any;
        const sw = (sprite.width || 0) / DPR || c.size;
        const sh = (sprite.height || 0) / DPR || c.size * aspect;

        ctx.drawImage(sprite, x, c.y, sw, sh);
      }
      raf = requestAnimationFrame(frame);
    };

    const start = async () => {
      if ((baseImg as any).decode) {
        try {
          await (baseImg as any).decode();
        } catch {}
      } else {
        await new Promise<void>((res) => {
          if (baseImg.complete) return res();
          baseImg.onload = () => res();
          baseImg.onerror = () => res();
        });
      }
      aspect =
        baseImg.naturalHeight && baseImg.naturalWidth
          ? baseImg.naturalHeight / baseImg.naturalWidth
          : aspect;
      resizeCanvas();
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onResize, { passive: true });
    start();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onResize);
      spriteCache.clear();
      cloudCanvas.remove();
    };
  }, []);

  // ---------- ESC to close modal ----------
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  if (error) return <div className="map-error">{error}</div>;

  return (
    <div
      className={`leaflet-shell ${className ?? ""}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        minHeight: "300px",
        background: "#e9eef4",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div ref={mapContainer} className="map-host" />

      <div className="clouds-spacer" aria-hidden="true" />

      {selected && (
    <div className="ll-modal-backdrop" onClick={closeModal}>
      <div className="ll-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="ll-modal-close" onClick={closeModal} aria-label="Close">✕</button>
        <div className="ll-modal-scroll">
          <div ref={modalImgHostRef} className="ll-modal-img-host" />
          <div className="ll-modal-reveal">
            <h3 className="ll-modal-title">{selected.title}</h3>
            
            {/* Redesigned Action Buttons Section */}
            <div className="action-buttons-section">
              {/* Primary Button - 80% width */}
              <div className="primary-button-container">
                <GetGemsButton
                  blockchainHash={selected.blockchainHash}
                  nftName={selected.title}
                  variant="primary"
                  onSuccess={(url) => console.log('GetGems opened:', url)}
                  onError={(error) => console.error('GetGems error:', error)}
                />
              </div>
              
              {/* Expandable Menu - 20% width */}
              <ExpandableMenu
                items={[
                  {
                    label: 'View on Map',
                    icon: '📍',
                    onClick: () => {
                      const urls = generateMapsUrls(selected.position[0], selected.position[1]);
                      window.open(urls.search, '_blank', 'noopener,noreferrer');
                    }
                  },
                  {
                    label: 'Get Directions',
                    icon: '🧭',
                    onClick: () => {
                      const urls = generateMapsUrls(selected.position[0], selected.position[1]);
                      window.open(urls.directions, '_blank', 'noopener,noreferrer');
                    }
                  },
                  {
                    label: 'Share',
                    icon: '📤',
                    onClick: () => {
                      const shareData = {
                        title: selected.title,
                        text: selected.description,
                        url: 'https://t.me/UrbanDreamsBot/Explorer'
                      };
                      
                      if (navigator.share) {
                        navigator.share(shareData);
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(window.location.href);
                        if (window.Telegram?.WebApp) {
                          window.Telegram.WebApp.showAlert('Link copied to clipboard!');
                        }
                      }
                    }
                  },
                  {
                    label: 'View On Chain',
                    icon: '🔗',
                    onClick: () => {
                      const itemUrl = `https://tonscan.org/nft/${selected.blockchainHash}`;
                      window.open(itemUrl, '_blank', 'noopener,noreferrer');
                    }
                  }
                ]}
              />
            </div>

          {selected.description && <p className="ll-modal-desc">{selected.description}</p>}

          <div className="collection-info">
            <p>Collection: <strong>Urban Dreams: Warsaw Edition</strong></p>
            <p className="address-info">
              {COLLECTION.URBAN_DREAMS.address.slice(0, 8)}...{COLLECTION.URBAN_DREAMS.address.slice(-6)}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


      <style>{`
        .urban-popup-shell .leaflet-popup-content-wrapper {
          background:${colors.bg};
          color:${colors.text};
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,.25);
        }
        .leaflet-popup-tip-container { display: none; }

        /* Cloud placeholder styles */
        .image-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .cloud-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #e9eef4 0%, #d8e1eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .cloud-animation {
          position: relative;
          width: 80px;
          height: 40px;
        }

        .cloud-circle {
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
          opacity: 0.8;
          animation: float 2s ease-in-out infinite;
        }

        .cloud-circle.large {
          width: 40px;
          height: 40px;
          top: 0;
          left: 20px;
          animation-delay: 0s;
        }

        .cloud-circle.medium {
          width: 30px;
          height: 30px;
          top: 5px;
          left: 10px;
          animation-delay: 0.5s;
        }

        .cloud-circle.small {
          width: 20px;
          height: 20px;
          top: 10px;
          left: 35px;
          animation-delay: 1s;
        }

        .image-error-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #e9eef4 0%, #d8e1eb 100%);
          border-radius: 8px;
          padding: 20px;
        }

        .error-text {
          margin-top: 10px;
          color: #708499;
          font-size: 14px;
          text-align: center;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        /* Ensure images load eagerly */
        .artwork-modern-img {
          loading: eager;
        }
      `}</style>
    </div>
  );
};