import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "/src/css/leafletmap.css";

// --- Mobile/iOS: CSS var для корректного 100vh ---
function useViewportUnits() {
  useEffect(() => {
    const set = () => {
      // визуальная высота (iOS корректно обрабатывает 100svh, но var --vh полезна для старых)
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    set();
    // ResizeObserver чуть стабильнее на iOS при смене хромаклавы/адресной строки
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
  emoji: string,
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

  const [selected, setSelected] = useState<Marker | null>(null);
  const modalImgHostRef = useRef<HTMLDivElement | null>(null);
  const adoptedImgRef = useRef<HTMLImageElement | null>(null);
  const originalParentRef = useRef<HTMLElement | null>(null);
  const originalNextRef = useRef<Node | null>(null);

  const warsawBounds: L.LatLngBoundsExpression = [
    [52.0969, 20.8510],
    [52.3580, 21.2710],
  ];

  const createMarkerIcon = (emoji = "📍") =>
    L.divIcon({
      className: "emoji-marker",
      html: `<span class="emoji" aria-hidden="true" style="font-size:2rem;line-height:0.1">${emoji}</span>`,
      iconAnchor: [0, 0],
      popupAnchor: [0, -20],
    });

  const openFromPopupImg = (imgEl: HTMLImageElement, mk: Marker) => {
    originalParentRef.current = imgEl.parentElement as HTMLElement | null;
    originalNextRef.current = imgEl.nextSibling;
    adoptedImgRef.current = imgEl;

    imgEl.classList.add("ll-modal-image");
    // часть стилей уехала в CSS-класс; минимальные инлайны:
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
      // оставляем класс — так попап-изображение в тултипе выглядит прилично
      if (next) parent.insertBefore(img, next);
      else parent.appendChild(img);
    }
    adoptedImgRef.current = null;
    originalParentRef.current = null;
    originalNextRef.current = null;
  };

  // ---------- Init Map (аккуратные опции для iOS) ----------
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    try {
      // небольшой твик на iOS: tapTolerance, zoomAnimationThreshold и inertia
      mapInstance.current = L.map(mapContainer.current, {
        center,
        zoom,
        minZoom: 12,
        maxZoom: 16,
        zoomControl: false, // мы добавим сами с отступом под safe-area
        attributionControl: false,
        touchZoom: true,
        bounceAtZoomLimits: false,
        maxBounds: warsawBounds,
        maxBoundsViscosity: 0.8, // чуть мягче, чтобы не "дёргалось"
        tapTolerance: 8,
        zoomAnimation: true,
        zoomAnimationThreshold: 8,
        inertia: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        detectRetina: true,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 1,
      }).addTo(mapInstance.current);

      // кастомное размещение зума с учётом safe-area
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

  // ---------- Render Markers ----------
  useEffect(() => {
    if (!mapInstance.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((mk) => {
      const icon = createMarkerIcon(mk.emoji);
      const marker = L.marker(mk.position, { icon, keyboard: false }).addTo(mapInstance.current!);

      const popupHtml = `
        <div class="artwork-modern">
          <img class="artwork-modern-img js-open-modal" src="${mk.img_src ?? "/404.png"}" alt="${mk.title}"
               loading="lazy" decoding="async" />
          <div class="artwork-modern-title">${mk.title ?? "Untitled"}</div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 320, className: "urban-popup-shell", autoPanPadding: [24, 24] });

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

      let imgEl: HTMLImageElement | null = null;
      const open = () => setSelected(mk);

      marker.on("popupopen", (e: any) => {
        const popupEl: HTMLElement | null = e?.popup?.getElement?.();
        const img = popupEl?.querySelector(".js-open-modal") as HTMLImageElement | null;
        if (img) {
          img.style.cursor = "zoom-in";
          img.addEventListener("click", () => openFromPopupImg(img, mk), { passive: true });
          imgEl = img;
        }
      });

      marker.on("popupclose", () => {
        if (imgEl) {
          // т.к. мы передаём новую функцию, removeEventListener по ссылке не сработает.
          // решаем просто: обнуляем ссылку; элемент сам умрёт с попапом.
          imgEl = null;
        }
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
    // на iOS DPR=2 ок; выше — редко и дорого
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    // на маленьких экранах уменьшаем кол-во облаков и размеры
    const small = window.matchMedia("(max-width: 430px)").matches;
    const CLOUD_COUNT = small ? 23 : 25;
    const SPEED_MIN = 18;
    const SPEED_MAX = small ? 32 : 45;
    const SIZE_MIN = small ? 160 : 220;
    const SIZE_MAX = small ? 320 : 450;
    const OPACITY = 0.43;
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
        // высота: 100svh (новый стандарт), fallback на var(--vh) и 100vh
        height: "100svh",
        minHeight: "300px",
        background: "#e9eef4",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div ref={mapContainer} className="map-host" />

      {/* Clouds overlay — создаём DOM в эффекте */}
      <div className="clouds-spacer" aria-hidden="true" />

      {/* Modal */}
      {selected && (
        <div className="ll-modal-backdrop" onClick={closeModal}>
          <div className="ll-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="ll-modal-close" onClick={closeModal} aria-label="Close">✕</button>
            <div className="ll-modal-scroll">
              <div ref={modalImgHostRef} className="ll-modal-img-host" />
              <div className="ll-modal-reveal">
                <h3 className="ll-modal-title">{selected.title}</h3>
                {selected.description && <p className="ll-modal-desc">{selected.description}</p>}
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
      `}</style>
    </div>
  );
};
