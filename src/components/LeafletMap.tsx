// src/components/LeafletMap.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
type Emoji = string;

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

  const createMarkerIcon = (emoji = "🖼️") =>
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
      <div class="urban-popup">
        ${
          mk.img_src
            ? `<div class="framed">
                 <img class="framed-art" src="${mk.img_src}" alt="${mk.title}" />
               </div>`
            : ""
        }
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
            const tex = loader.load(
              "https://cdn.pixabay.com/photo/2022/03/20/17/50/clouds-7081496_960_720.png"
            );

            const material = new THREE.SpriteMaterial({
              map: tex,
              transparent: true,
              opacity: 0.25,
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
  
    // Create an absolutely positioned canvas for clouds
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.style.position = 'absolute';
    cloudCanvas.style.top = '0';
    cloudCanvas.style.left = '0';
    cloudCanvas.style.width = '100%';
    cloudCanvas.style.height = '100%';
    cloudCanvas.style.pointerEvents = 'none';
    cloudCanvas.style.zIndex = '700';
    mapContainer.current!.appendChild(cloudCanvas);
  
    const ctx = cloudCanvas.getContext('2d')!;
    const cloudImg = new Image();
    cloudImg.src = 'https://cdn.pixabay.com/photo/2022/03/20/17/50/clouds-7081496_960_720.png';
    cloudImg.onload = () => animateClouds();
  
    let clouds: { x: number; y: number; speed: number; size: number }[] = [];
    console.log(cloudCanvas.width);
    console.log(cloudCanvas.height);

    const initClouds = () => {
      clouds = [];
      for (let i = 0; i < 30; i++) {
        console.log(Math.random());
        clouds.push({
          x: (Math.random() * cloudCanvas.width),
          y: Math.random() * cloudCanvas.height,
          speed: 0.4 + Math.random() * 0.2,
          size: 250 + Math.random() * 350
        });
      }
    };
  
    const animateClouds = () => {
      ctx.clearRect(0, 0, cloudCanvas.width, cloudCanvas.height);
      ctx.globalAlpha = 0.35;
  
      clouds.forEach(cloud => {
        ctx.drawImage(cloudImg, cloud.x, cloud.y, cloud.size, cloud.size * 0.67);
        cloud.x += cloud.speed;
        if (cloud.x > cloudCanvas.width) {
          cloud.x = -cloud.size;
          cloud.y = Math.random() * cloudCanvas.height * 0.5;
        }
      });
  
      requestAnimationFrame(animateClouds);
    };
  
    const resizeCanvas = () => {
      cloudCanvas.width = mapContainer.current!.clientWidth;
      cloudCanvas.height = mapContainer.current!.clientHeight;
      initClouds();
    };
  
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  
    return () => {
      window.removeEventListener('resize', resizeCanvas);
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
          background:${colors.secondaryBg};
          color:${colors.text};
          padding: 0;
        }
        .urban-popup-shell .leaflet-popup-tip {
          background:${colors.secondaryBg};
        }

        .popup-title{
          margin: 10px 2px 0;
          font-size: 16px;
          line-height: 1.25;
          color: ${colors.light_white};
          letter-spacing: .2px;
        }
        .popup-desc{
          margin: 6px 2px 0;
          font-size: 13px;
          color: ${colors.hint};
        }

        .framed{
          position: relative;
          width: 100%;
          max-width: 30rem;
          aspect-ratio: 4 / 3;           /* tweak if your frame is taller/wider */
          overflow: hidden;
          border-radius: 8px;             /* optional: soft corners */
        }
        
        /* The artwork sits behind the frame and fills the space */
        .framed-art{
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;              /* crop nicely */
          filter: saturate(1.02) contrast(1.02)
        }
        
        /* The frame PNG overlays on top */
        .framed::after{
          content: "";
          color: transparent;
          position: absolute;
          inset: 0;
          bakground-color: transparent;
          background: url("/golden.png") center / 100% 100% no-repeat;
          pointer-events: none;           /* clicks pass to the popup */
        }

        .leaflet-popup-tip-container {
          display: none;
        }
      `}</style>
    </div>
  );
};
