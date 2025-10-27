import React, { useEffect, useRef, useState } from "react";

export default function Go2RTCPlayer({ src }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buat PeerConnection di luar async function agar bisa diakses di cleanup
    const pc = new RTCPeerConnection();
    let isMounted = true; // Flag untuk mencegah update state jika komponen unmount

    const startStream = async () => {
      try {
        setLoading(true);

        pc.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
            setLoading(false);
          }
        };

        const offer = await pc.createOffer({
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);

        // PERBAIKAN: Gunakan POST dan endpoint /api/webrtc
        const res = await fetch(
          `http://114.9.13.244:1984/api/webrtc?src=${src}`, // URL API yang benar
          {
            method: "POST", // Method yang benar
            headers: { "Content-Type": "application/sdp" },
            body: offer.sdp,
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch answer: ${res.statusText}`);
        }

        const answer = await res.text();
        
        // Cek jika komponen masih ada sebelum set state
        if (!isMounted) return; 

        await pc.setRemoteDescription({
          type: "answer",
          sdp: answer,
        });

      } catch (error) {
        console.error("Error starting WebRTC stream:", error);
        if (isMounted) {
          setLoading(false); // Berhenti loading jika ada error
        }
      }
    };

    startStream();

    // PERBAIKAN: Tambahkan cleanup function
    return () => {
      isMounted = false; // Set flag unmount
      pc.close(); // Tutup koneksi WebRTC saat komponen unmount/src berubah
    };
  }, [src]); // Dependency array [src] sudah benar

  return (
    <div className="flex flex-col items-center bg-gray-900 p-4 rounded-2xl shadow-lg">
      {loading && (
        <div className="text-white text-center mb-2 animate-pulse">
          🔄 Memuat stream {src}...
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-xl w-full max-w-3xl border border-gray-700"
      />
    </div>
  );
}