"use client";

import { useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (base64Data: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    // Check for camera devices and request stream
    async function startCamera() {
      try {
        setError(null);
        setIsCapturing(true);

        const currentDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = currentDevices.filter(d => d.kind === "videoinput");
        setDevices(videoDevices);

        const constraints: MediaStreamConstraints = {
          video: activeDeviceId
            ? { deviceId: { exact: activeDeviceId } }
            : { facingMode: "environment" } // default to back camera
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Auto select active device id if not set
        if (!activeDeviceId && videoDevices.length > 0) {
          // Find the active track's device ID
          const activeTrack = mediaStream.getVideoTracks()[0];
          const activeSettings = activeTrack?.getSettings();
          if (activeSettings?.deviceId) {
            setActiveDeviceId(activeSettings.deviceId);
          }
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        setError("Camera access is blocked or unavailable. Please upload a receipt file instead.");
      } finally {
        setIsCapturing(false);
      }
    }

    startCamera();

    return () => {
      // Clean up track streams on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeDeviceId]);

  // Switch camera between front/back or multiple cameras
  function switchCamera() {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(d => d.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setActiveDeviceId(devices[nextIndex].deviceId);
  }

  // Snap photo from the video stream
  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Use video track settings to get actual dimensions or fallback to elements
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, width, height);
    
    // Get Base64 image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCapture(dataUrl);

    // Stop streams
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }

  // Fallback file input handler
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onCapture(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#171020] text-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-black uppercase tracking-wider text-[#c9ff4d]">Scan Receipt Bill</h4>
        <button 
          type="button" 
          onClick={onCancel} 
          className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full"
        >
          Cancel Camera
        </button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
          <p className="text-sm font-semibold text-white/70 mb-4">{error}</p>
          <label className="cursor-pointer rounded-xl bg-[#ff6679] hover:bg-[#eb4e64] px-5 py-3 font-extrabold text-white text-sm transition">
            Choose Receipt Image
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </label>
        </div>
      ) : (
        <div className="relative">
          {/* Video Container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black border border-white/10">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="h-full w-full object-cover"
            />
            
            {/* Target overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] h-[70%] border-2 border-dashed border-[#c9ff4d]/80 rounded-lg flex flex-col justify-between p-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#c9ff4d] bg-[#171020]/80 w-fit px-1.5 py-0.5 rounded">
                  Place bill inside
                </span>
                <span className="text-[10px] text-right font-black uppercase tracking-wider text-[#c9ff4d] bg-[#171020]/80 w-fit ml-auto px-1.5 py-0.5 rounded">
                  Receipt Guide
                </span>
              </div>
            </div>

            {isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="animate-pulse text-sm font-bold">Accessing camera...</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between gap-3">
            {devices.length > 1 && (
              <button
                type="button"
                onClick={switchCamera}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition text-sm font-bold"
                title="Switch Camera"
              >
                🔄 Flip Camera
              </button>
            )}
            
            <button
              type="button"
              onClick={capturePhoto}
              disabled={isCapturing}
              className="flex-1 bg-[#c9ff4d] hover:bg-[#b0e03e] text-[#171020] font-black py-3 px-5 rounded-xl transition text-center shadow-lg"
            >
              📷 Take Photo
            </button>

            <label className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition text-sm font-bold cursor-pointer">
              📁 Upload File
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      )}

      {/* Hidden Canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
