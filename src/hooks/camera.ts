import { useEffect, useState } from "react";

export const useVideoDevices = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[] | null>(null);
  const [error, setError] = useState<unknown | null>(null);

  const getDevices = async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      stream.getTracks().forEach((track) => track.stop());

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = allDevices.filter(
        (device) => device.kind === "videoinput",
      );

      setDevices(videoInputDevices);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    getDevices();
  }, []);

  return {
    devices,
    error,
  };
};
