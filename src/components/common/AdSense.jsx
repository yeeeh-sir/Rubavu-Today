import React, { useEffect, useRef } from "react";

const AdSense = () => {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle col-span-full w-full"
      style={{ display: "block" }}
      data-ad-client="ca-pub-5396678004224708"
      data-ad-slot="3448384822"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdSense;