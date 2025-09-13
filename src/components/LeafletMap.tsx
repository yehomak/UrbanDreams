// src/components/LeafletMap.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import '/src/css/leafletmap.css';

// --- Colors ---------------------------------------------------------------
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
  const warsawBounds: L.LatLngBoundsExpression = [
    [52.0969, 20.8510],
    [52.3580, 21.2710]
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
        maxBoundsViscosity: 1.0
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        detectRetina: true,
      }).addTo(mapInstance.current);

      // zoom control in top-right to avoid cloud overlay title
      L.control
        .zoom({ position: "topright" })
        .addTo(mapInstance.current as L.Map);

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
        <img class="artwork-modern-img" src="${mk.img_src ?? "/404.png"}" alt="${mk.title}" />
        <div class="artwork-modern-title">${mk.title ?? "Untitled"}</div>
      </div>
    `;

      marker.bindPopup(popupHtml, { maxWidth: 320, className: "urban-popup-shell" });
      markersRef.current.push(marker);
    });
  }, [markers]);

  // ---------- Cloud Overlay (Three.js) -----------------------------------
  const CloudOverlay = useMemo(
    () =>
      function CloudOverlayInner() {
        const mountRef = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
          let renderer: any;
          let scene: any;
          let camera: any;
          let raf = 0;
          let clouds: any[] = [];

          let disposed = false;

          (async () => {
            const THREE = await import("three");

            const W = mountRef.current!.clientWidth;
            const H = mountRef.current!.clientHeight;

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 1000);
            camera.position.z = 5;

            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(W, H);
            renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
            mountRef.current!.appendChild(renderer.domElement);

            // texture (soft transparent cloud)
            const loader = new THREE.TextureLoader();
            const tex = loader.load("./base_cloud.png");

            const material = new THREE.SpriteMaterial({
              map: tex,
              transparent: true,
              opacity: 0.35,
              depthWrite: false,
            });

            // make a soft field of sprites
            for (let i = 0; i < 18; i++) {
              const s = new THREE.Sprite(material.clone());
              const scale = 3 + Math.random() * 3;
              s.scale.set(scale, scale * 0.65, 1);
              s.position.set(Math.random() * 12 - 6, Math.random() * 4 - 2, Math.random() * -6);
              scene.add(s);
              // speed + direction
              (s as any).__vx = 0.002 + Math.random() * 0.004;
              clouds.push(s);
            }

            const onResize = () => {
              if (!mountRef.current) return;
              const w = mountRef.current.clientWidth;
              const h = mountRef.current.clientHeight;
              renderer.setSize(w, h);
              camera.aspect = w / h;
              camera.updateProjectionMatrix();
            };
            window.addEventListener("resize", onResize);

            const animate = () => {
              if (disposed) return;
              clouds.forEach((c) => {
                c.position.x += c.__vx;
                if (c.position.x > 7) c.position.x = -7;
              });
              renderer.render(scene, camera);
              raf = requestAnimationFrame(animate);
            };
            animate();

            // cleanup
            return () => {
              disposed = true;
              cancelAnimationFrame(raf);
              window.removeEventListener("resize", onResize);
              clouds = [];
              if (renderer) {
                renderer.dispose?.();
                mountRef.current?.removeChild(renderer.domElement);
              }
            };
          })();

          return () => {
            // handled in async cleanup above
          };
        }, []);

        return (
          <div
            ref={mountRef}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none", // make overlay ignore mouse
            }}
          />
        );
      },
    []
  );

  useEffect(() => {
    if (!mapInstance.current) return;
  
    // --- setup canvas layer -------------------------------------------------
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
  
    // --- config -------------------------------------------------------------
    const CLOUD_COUNT = 25;             // fewer + bigger is cheaper
    const SPEED_MIN = 20;               // px / second (DPR-aware via transform)
    const SPEED_MAX = 45;
    const SIZE_MIN = 220;
    const SIZE_MAX = 450;
    const OPACITY = 0.38;
    const SPRITE_BUCKETS = [240, 320, 400]; // pre-render 3 sizes, snap each cloud to nearest
  
    type Cloud = {
      y: number;           // in CSS pixels
      size: number;        // CSS px, snapped to nearest bucket
      speed: number;       // px/sec (CSS pixels / sec)
      sprite: HTMLCanvasElement | OffscreenCanvas;
      phase: number;       // initial x offset in [ -size, width )
    };
  
    // --- utils --------------------------------------------------------------
    // deterministic PRNG so clouds don't jump around on resize
    let seed = 1337;
    const rand = () => {
      // xorshift32
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      return ((seed >>> 0) % 1_000_000) / 1_000_000;
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const nearest = (n: number, arr: number[]) =>
      arr.reduce((p, c) => (Math.abs(c - n) < Math.abs(p - n) ? c : p), arr[0]);
  
    // --- image + sprite cache ----------------------------------------------
    const baseImg = new Image();
    baseImg.src = "./base_cloud.png";
  
    let aspect = 0.67; // fallback
    const spriteCache = new Map<number, HTMLCanvasElement | OffscreenCanvas>();
  
    const makeSprite = (targetSize: number) => {
      // cache key includes targetSize
      const key = targetSize | 0;
      const cached = spriteCache.get(key);
      if (cached) return cached;
  
      const w = Math.max(1, Math.round(targetSize * DPR));
      const h = Math.max(1, Math.round(targetSize * aspect * DPR));
  
      // prefer OffscreenCanvas if available
      const off =
        typeof (window as any).OffscreenCanvas !== "undefined"
          ? new (window as any).OffscreenCanvas(w, h)
          : (() => {
              const c = document.createElement("canvas");
              c.width = w; c.height = h;
              return c;
            })();
  
      const octx = (off as any).getContext("2d") as CanvasRenderingContext2D;
      // no smoothing change: default is fine for soft clouds
      octx.clearRect(0, 0, w, h);
      octx.drawImage(baseImg, 0, 0, w, h);
      spriteCache.set(key, off);
      return off;
    };
  
    // --- state kept across frames ------------------------------------------
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
  
      // set backing store size with DPR
      cloudCanvas.width = Math.max(1, Math.round(w * DPR));
      cloudCanvas.height = Math.max(1, Math.round(h * DPR));
      // reset transform so we can draw in CSS pixels directly
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalAlpha = OPACITY;
  
      // re-seed to keep layout stable across resizes
      seed = 1337;
  
      // rebuild clouds but reuse speeds/sizes distribution deterministically
      clouds = new Array(CLOUD_COUNT).fill(0).map(() => {
        const size = nearest(lerp(SIZE_MIN, SIZE_MAX, rand()), SPRITE_BUCKETS);
        const speed = lerp(SPEED_MIN, SPEED_MAX, rand()); // px/sec
        const y = Math.round(rand() * (heightCSS - size * aspect));
        const phase = Math.round(rand() * (widthCSS + size)) - size; // start anywhere incl. off-screen
        const sprite = makeSprite(size);
        return { y, size, speed, sprite, phase };
      });
  
      // restart timebase to avoid dt spikes after resize
      startTime = performance.now();
    };
  
    // debounce resize with rAF (no layout thrash)
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
      const t = (now - startTime) / 1000; // seconds
  
      // clear using CSS pixels (transform is set to DPR already)
      ctx.clearRect(0, 0, widthCSS, heightCSS);
  
      // draw clouds
      // NOTE: all math in CSS pixels; sprite already DPR-scaled
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        // wrap using modulo over [ -size, width + size )
        const total = widthCSS + c.size;
        let x = ((c.phase + c.speed * t) % total);
        if (x < 0) x += total;
        x -= c.size;
  
        // OffscreenCanvas has its own bitmap size; draw at CSS size
        const sprite = c.sprite as any;
        const sw = (sprite.width || (c.size * DPR)) / DPR;
        const sh = (sprite.height || (c.size * aspect * DPR)) / DPR;
  
        ctx.drawImage(sprite, x, c.y, sw, sh);
      }
  
      raf = requestAnimationFrame(frame);
    };
  
    const start = async () => {
      // Wait for base image to be decoded for crisp sprites
      if ((baseImg as any).decode) {
        try { await (baseImg as any).decode(); } catch { /* ignore */ }
      } else {
        // fallback if decode() not present
        await new Promise<void>((res) => {
          if (baseImg.complete) return res();
          baseImg.onload = () => res();
          baseImg.onerror = () => res();
        });
      }
      // compute aspect from the actual image
      aspect = baseImg.naturalHeight && baseImg.naturalWidth
        ? baseImg.naturalHeight / baseImg.naturalWidth
        : aspect;
  
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
      <div
        ref={mapContainer}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Clouds overlay */}
      <CloudOverlay />

      {/* Local styles for popups + frames */}
      <style>{`
        .urban-popup-shell .leaflet-popup-content-wrapper {
          background:${colors.text};
          color:${colors.text};
          padding: 0;
        }

        .leaflet-popup-tip-container {
          display: none;
        }
      `}</style>
    </div>
  );
};
