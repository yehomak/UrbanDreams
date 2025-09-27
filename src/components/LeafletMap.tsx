import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "/src/css/leafletmap.css";

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

type MarkerType = "office" | "park" | "landmark" | "balcony" | "station" | "gallery" | "default";

interface Marker {
  position: [number, number];
  title: string;
  description?: string;
  img_src?: string;
  type?: MarkerType;
  /** Optional TON contract address for TON Viewer link */
  contract?: string;
}

export const LeafletMap: React.FC<{
  center: [number, number];
  zoom?: number;
  markers?: Marker[];
  className?: string;
}> = ({ center, zoom = 13, markers = [], className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);

  /** Selected item for full-screen modal */
  const [selected, setSelected] = useState<Marker | null>(null);

  const modalImgHostRef = useRef<HTMLDivElement | null>(null);

  const adoptedImgRef = useRef<HTMLImageElement | null>(null);
  const originalParentRef = useRef<HTMLElement | null>(null);
  const originalNextRef = useRef<Node | null>(null);

  const openFromPopupImg = (imgEl: HTMLImageElement, mk: Marker) => {
    // Remember where the img lives to restore later
    originalParentRef.current = imgEl.parentElement as HTMLElement | null;
    originalNextRef.current = imgEl.nextSibling;
  
    adoptedImgRef.current = imgEl;
    // Make sure it looks good in the modal (no transform animation on it)
    imgEl.classList.add("ll-modal-image");
    imgEl.style.maxWidth = "min(720px, 90%)";
    imgEl.style.maxHeight = "48vh";
    imgEl.style.objectFit = "contain";
    imgEl.style.borderRadius = "12px";
    imgEl.style.boxShadow = "0 8px 24px rgba(0,0,0,.35)";
    imgEl.style.background = "#0b111a";
    imgEl.style.display = "block";
    imgEl.style.margin = "0 auto";
  
    setSelected(mk); // mount modal
  };

  useEffect(() => {
    if (!selected || !adoptedImgRef.current || !modalImgHostRef.current) return;
    // Append the real popup image node into the modal
    modalImgHostRef.current.appendChild(adoptedImgRef.current);
  }, [selected]);

  const closeModal = () => {
    const img = adoptedImgRef.current;
    const parent = originalParentRef.current;
    const next = originalNextRef.current;
  
    setSelected(null);
  
    // Restore DOM if popup still exists
    if (img && parent) {
      img.removeAttribute("style"); // optional: keep styles if you like them in popup
      // keep ll-modal-image class or remove it if you don't want popup styling:
      // img.classList.remove("ll-modal-image");
  
      if (next) parent.insertBefore(img, next);
      else parent.appendChild(img);
    }
  
    adoptedImgRef.current = null;
    originalParentRef.current = null;
    originalNextRef.current = null;
  };

  const warsawBounds: L.LatLngBoundsExpression = [
    [52.0969, 20.8510],
    [52.3580, 21.2710],
  ];

  const createMarkerIcon = (emoji = "📍") =>
    L.divIcon({
      className: "emoji-marker",
      html: `<span class="emoji" style="font-size:2rem;line-height:0.1">${emoji}</span>`,
      iconAnchor: [0, 0],
      popupAnchor: [0, -20],
    });

  // ---------- Init Map ----------------------------------------------------
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
        maxBoundsViscosity: 1.0,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        detectRetina: true,
      }).addTo(mapInstance.current);

      L.control.zoom({ position: "topright" }).addTo(mapInstance.current as L.Map);

      return () => {
        mapInstance.current?.remove();
        mapInstance.current = null;
      };
    } catch (err) {
      setError("Failed to initialize map");
      console.error(err);
    }
  }, [center, zoom]);

  // ---------- Render Markers ---------------------------------------------
  useEffect(() => {
    if (!mapInstance.current) return;
  
    // clear previous
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  
    markers.forEach((mk) => {
      const icon = createMarkerIcon();
      const marker = L.marker(mk.position, { icon }).addTo(mapInstance.current!);
  
      const popupHtml = `
        <div class="artwork-modern">
          <img class="artwork-modern-img js-open-modal" src="${mk.img_src ?? "/404.png"}" alt="${mk.title}" />
          <div class="artwork-modern-title">${mk.title ?? "Untitled"}</div>
        </div>
      `;
  
      marker.bindPopup(popupHtml, { maxWidth: 320, className: "urban-popup-shell" });
  
9
      marker.on("click", () => {
        const map = mapInstance.current!;
        const target = marker.getLatLng();
        const pt = map.project(target, zoom);
        const offsetY = 180;
        const offsetX = 10;
        const newCenter = map.unproject(L.point(pt.x + offsetX, pt.y - offsetY), zoom);
        map.flyTo(newCenter, map.getZoom(), { duration: 2.5 });
      });
  
      // Bridge DOM inside Leaflet popup to React state
      let imgEl: HTMLElement | null = null;
      const open = () => setSelected(mk);
  
      marker.on("popupopen", (e: any) => {
        const popupEl: HTMLElement | null = e?.popup?.getElement?.();
        const imgEl = popupEl?.querySelector(".js-open-modal") as HTMLImageElement | null;
        if (imgEl) {
          imgEl.style.cursor = "zoom-in";
          imgEl.addEventListener("click", () => openFromPopupImg(imgEl, mk));
        }
      });
  
      marker.on("popupclose", () => {
        if (imgEl) imgEl.removeEventListener("click", open);
        imgEl = null;
      });
  
      markersRef.current.push(marker);
    });
  
    // cleanup when markers list changes
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [markers]);
  

  // ---------- Cloud Overlay (Three.js placeholder kept) -------------------
  const CloudOverlay = useMemo(
    () =>
      function CloudOverlayInner() {
        const mountRef = useRef<HTMLDivElement | null>(null);
        useEffect(() => {
          // no-op: you already have a performant canvas overlay below
          return () => {};
        }, []);
        return <div ref={mountRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
      },
    []
  );

  // ---------- Canvas cloud overlay (kept as-is) ---------------------------
  useEffect(() => {
    if (!mapInstance.current) return;

    const cloudCanvas = document.createElement("canvas");
    cloudCanvas.style.position = "absolute";
    cloudCanvas.style.top = "0";
    cloudCanvas.style.left = "0";
    cloudCanvas.style.width = "100%";
    cloudCanvas.style.height = "100%";
    cloudCanvas.style.pointerEvents = "none";
    cloudCanvas.style.zIndex = "700";
    mapContainer.current!.appendChild(cloudCanvas);

    const ctx = cloudCanvas.getContext("2d")!;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const CLOUD_COUNT = 25;
    const SPEED_MIN = 20;
    const SPEED_MAX = 45;
    const SIZE_MIN = 220;
    const SIZE_MAX = 450;
    const OPACITY = 0.38;
    const SPRITE_BUCKETS = [240, 320, 400];

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
    const nearest = (n: number, arr: number[]) => arr.reduce((p, c) => (Math.abs(c - n) < Math.abs(p - n) ? c : p), arr[0]);

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
        const y = Math.round(rand() * (heightCSS - size * aspect));
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
      aspect = baseImg.naturalHeight && baseImg.naturalWidth ? baseImg.naturalHeight / baseImg.naturalWidth : aspect;
      resizeCanvas();
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("resize", onResize);
    start();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      spriteCache.clear();
      cloudCanvas.remove();
    };
  }, []);

  // ---------- ESC to close modal -----------------------------------------
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
      className={className}
      style={{
        position: "relative",
        width: "100vw",
        height: "150vh",
        minHeight: 300,
        maxHeight: 800,
        background: "#e9eef4",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Map */}
      <div ref={mapContainer} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />

      {/* Clouds overlay */}
      <CloudOverlay />

      {/* Item Modal */}
      {selected && (
        <div className="ll-modal-backdrop" onClick={closeModal}>
          <div className="ll-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="ll-modal-close" onClick={closeModal}>✕</button>

            <div className="ll-modal-scroll">
              {/* The REAL popup <img> is moved here */}
              <div ref={modalImgHostRef} className="ll-modal-img-host" />

              {/* Gradual reveal from under the image */}
              <div className="ll-modal-reveal open">
                <h3 className="ll-modal-title">{selected.title}</h3>
                {selected.description && <p className="ll-modal-desc">{selected.description}</p>}
              </div>
            </div>

            {/* <div className="ll-modal-actions">
              {selected.contract ? (
                <a
                  className="ll-tonviewer-btn"
                  href={`https://tonviewer.com/${encodeURIComponent(selected.contract)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on TON Viewer
                </a>
              ) : (
                <button className="ll-tonviewer-btn ll-tonviewer-btn--disabled" disabled>
                  No contract provided
                </button>
              )}
            </div> */}
          </div>
        </div>
      )}

      {/* Local styles for popups + frames */}
      <style>{`
        .urban-popup-shell .leaflet-popup-content-wrapper {
          background:${colors.text};
          color:${colors.text};
          padding: 0;
        }
        .leaflet-popup-tip-container { display: none; }
      `}</style>
    </div>
  );
};
