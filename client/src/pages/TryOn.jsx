import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Camera, Download, ImagePlus, RotateCw, Maximize2, RefreshCcw, ShoppingBag, Aperture, Lock } from 'lucide-react';
import { useProducts, useTitle } from '../lib/hooks';
import { useStore } from '../context/StoreContext';
import { formatPrice, canBuy } from '../lib/format';
import { Button, PageHeader } from '../components/ui';
import { ProductGrid } from '../components/ProductCard';
import { fitWrist } from '../lib/wristFit';

const DEFAULT_POSE = { x: 0.5, y: 0.5, scale: 0.34, rotate: 90, opacity: 1 };

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function TryOn({ mirror = false }) {
  useTitle(mirror ? 'Live Mirror' : 'AI Virtual Try-On');
  const [sp, setSp] = useSearchParams();
  const { products, loading, error } = useProducts({ tryOn: 1 });
  const { addToCart } = useStore();
  const [photo, setPhoto] = useState(null);
  const [camera, setCamera] = useState(false);
  const [camError, setCamError] = useState(null);
  const [pose, setPose] = useState(DEFAULT_POSE);
  const [placed, setPlaced] = useState(false); // has the user tapped their wrist yet?
  const [fitNote, setFitNote] = useState(null);
  const stageRef = useRef(null);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const drag = useRef(null);
  const fileRef = useRef(null);

  const watch = products.find((p) => p.slug === sp.get('watch')) || null;
  const pick = (p) => {
    setSp({ watch: p.slug }, { replace: true });
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamera(false);
  }, []);

  const startCamera = async () => {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } }, audio: false });
      streamRef.current = stream;
      setPhoto(null);
      setCamera(true);
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = stream; });
    } catch {
      setCamError('Camera access was blocked. Allow camera permission or upload a photo instead.');
    }
  };

  useEffect(() => { if (mirror) startCamera(); return stopCamera; /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [mirror]);
  useEffect(() => () => { if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo); }, [photo]);

  const onFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    stopCamera();
    setPhoto(URL.createObjectURL(file));
    setPose(DEFAULT_POSE);
    setPlaced(false);
    setFitNote(null);
  };

  // Tap on the photo/video: fit the watch to the wrist at that point
  const onStageClick = (e) => {
    const media = camera ? videoRef.current : photoRef.current;
    if (!media || e.target !== media) return; // ignore clicks on the watch itself
    const r = media.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    const fit = fitWrist(media, nx, ny);
    setPose((p) => (fit ? { ...p, ...fit } : { ...p, x: nx, y: ny }));
    setFitNote(fit ? null : "Couldn't read the wrist clearly — placed at your tap. Adjust size and rotation below.");
    setPlaced(true);
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    stopCamera();
    setPhoto(c.toDataURL('image/jpeg', 0.92));
    // Keep the placement made on the live view; the frame is identical
  };

  // Drag to move
  const onPointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, x: pose.x, y: pose.y };
  };
  const onPointerMove = (e) => {
    if (!drag.current || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const d = drag.current;
    setPose((p) => ({ ...p, x: Math.min(1, Math.max(0, d.x + (e.clientX - d.sx) / r.width)), y: Math.min(1, Math.max(0, d.y + (e.clientY - d.sy) / r.height)) }));
  };
  const onPointerUp = () => { drag.current = null; };
  const onWheel = (e) => {
    if (!watch) return;
    setPose((p) => ({ ...p, scale: Math.min(1, Math.max(0.08, p.scale - e.deltaY * 0.0005)) }));
  };

  const download = async () => {
    if (!photo || !watch) return;
    const [base, w] = await Promise.all([loadImage(photo), loadImage(watch.tryOnImage)]);
    const c = document.createElement('canvas');
    c.width = base.naturalWidth; c.height = base.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(base, 0, 0);
    const size = pose.scale * c.width;
    ctx.save();
    ctx.globalAlpha = pose.opacity;
    ctx.translate(pose.x * c.width, pose.y * c.height);
    ctx.rotate((pose.rotate * Math.PI) / 180);
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = size * 0.06; ctx.shadowOffsetY = size * 0.02;
    ctx.drawImage(w, -size / 2, -size / 2, size, size);
    ctx.restore();
    const a = document.createElement('a');
    a.href = c.toDataURL('image/jpeg', 0.92);
    a.download = `basha-gadgets-try-on-${watch.slug}.jpg`;
    a.click();
  };

  const overlay = watch && (
    <img
      src={watch.tryOnImage}
      alt={`${watch.name} on your wrist`}
      draggable={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="absolute cursor-grab touch-none select-none drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] active:cursor-grabbing"
      style={{ left: `${pose.x * 100}%`, top: `${pose.y * 100}%`, width: `${pose.scale * 100}%`, opacity: pose.opacity, transform: `translate(-50%, -50%) rotate(${pose.rotate}deg)` }}
    />
  );

  return (
    <>
      <PageHeader eyebrow={mirror ? 'Basha Gadgets Live Mirror' : 'Basha Gadgets AI Virtual Try-On'} lines={['SEE IT', 'ON YOUR WRIST.']}>
        Upload your wrist. Choose a timepiece. See how it looks on you. Drag the watch into place, pinch or scroll to resize, and save your look.
      </PageHeader>

      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1.25fr_1fr]">
        {/* Stage */}
        <div>
          <div className="relative flex justify-center overflow-hidden border border-gold/30 bg-deep">
            {camera || photo ? (
              // The inner box is exactly the size of the displayed photo, so overlay percentages map 1:1 to the image
              <div ref={stageRef} onWheel={onWheel} onClick={onStageClick} className="relative max-w-full cursor-crosshair">
                {camera
                  ? <video ref={videoRef} autoPlay playsInline muted className="block max-h-[72vh] w-auto max-w-full" />
                  : <img ref={photoRef} src={photo} alt="Your wrist" className="block max-h-[72vh] w-auto max-w-full select-none" draggable={false} />}
                {overlay}
                {!placed && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 bg-black/70 px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-primary">
                    Tap on your wrist to place the watch
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-5 p-8 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40"><ImagePlus className="h-6 w-6 text-primary" strokeWidth={1.2} /></div>
                <div>
                  <p className="font-serif text-2xl">Upload your wrist</p>
                  <p className="mt-2 text-sm text-muted-foreground">Take a clear photo or choose one from your library.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={() => fileRef.current?.click()}><ImagePlus /> Choose photo</Button>
                  <Button variant="outline" onClick={startCamera}><Camera /> Use camera</Button>
                </div>
                {camError && <p className="text-xs text-destructive">{camError}</p>}
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><Lock className="h-3 w-3" /> Your photo never leaves your device</p>
              </div>
            )}
            {(photo || camera) && placed && !watch && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-primary">Now choose a timepiece to try on →</div>
            )}
          </div>
          {fitNote && <p className="mt-2 text-xs text-muted-foreground">{fitNote}</p>}
          {(photo || camera) && placed && <p className="mt-2 text-[11px] text-muted-foreground">Tap elsewhere on your wrist to re-fit · drag the watch to fine-tune · scroll to resize</p>}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files[0])} />

          {(photo || camera) && (
            <div className="mt-4 space-y-4 border border-border p-5">
              {watch && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Slider icon={Maximize2} label="Size" min={0.08} max={1} step={0.005} value={pose.scale} onChange={(v) => setPose({ ...pose, scale: v })} />
                  <Slider icon={RotateCw} label="Rotate" min={-180} max={180} step={1} value={pose.rotate} onChange={(v) => setPose({ ...pose, rotate: v })} />
                  <Slider icon={Aperture} label="Blend" min={0.5} max={1} step={0.01} value={pose.opacity} onChange={(v) => setPose({ ...pose, opacity: v })} />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {camera && <Button onClick={capture}><Camera /> Capture</Button>}
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><ImagePlus /> New photo</Button>
                {!camera && <Button variant="outline" size="sm" onClick={startCamera}><Camera /> Camera</Button>}
                {watch && <Button variant="ghost" size="sm" onClick={() => setPose(DEFAULT_POSE)}><RefreshCcw /> Reset</Button>}
                {photo && watch && <Button variant="ghost" size="sm" onClick={download}><Download /> Save look</Button>}
              </div>
            </div>
          )}

          {watch && (
            <div className="mt-4 flex items-center gap-4 border border-primary/30 bg-primary/5 p-4">
              <img src={watch.image} alt="" className="h-16 w-16 bg-ivory object-contain p-1" />
              <div className="flex-1">
                <p className="text-[9px] uppercase tracking-[0.22em] text-primary">{watch.brand}</p>
                <Link to={`/product/${watch.slug}`} className="font-serif text-lg leading-tight hover:text-primary">{watch.name}</Link>
                <p className="text-sm">{formatPrice(watch.price)}</p>
              </div>
              <Button size="sm" disabled={!canBuy(watch)} onClick={() => addToCart(watch.id)}><ShoppingBag /> Add</Button>
            </div>
          )}
        </div>

        {/* Picker */}
        <div>
          <p className="eyebrow mb-2">Choose your timepiece</p>
          <p className="mb-6 text-sm text-muted-foreground">Explore the collection and select the watch that speaks to you.</p>
          <div className="max-h-[78vh] overflow-y-auto pr-1">
            <ProductGrid products={products} loading={loading} error={error} onTry={pick} selectedId={watch?.id} cols="sm:grid-cols-2" />
          </div>
        </div>
      </div>
    </>
  );
}

function Slider({ icon: Icon, label, ...props }) {
  return (
    <label className="block">
      <span className="label flex items-center gap-1.5"><Icon className="h-3 w-3" /> {label}</span>
      <input type="range" {...props} onChange={(e) => props.onChange(Number(e.target.value))} className="w-full accent-gold" />
    </label>
  );
}
