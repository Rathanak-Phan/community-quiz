import { useEffect, useRef } from "react";

export default function RecaptchaWidget({ siteKey, onVerify, onExpire }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!siteKey) {
      console.warn("reCAPTCHA siteKey is missing");
      return;
    }

    let isMounted = true;

    // Define the render function
    const renderWidget = () => {
      if (window.grecaptcha && containerRef.current && widgetIdRef.current === null) {
        try {
          const id = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => {
              if (onVerify) onVerify(token);
            },
            "expired-callback": () => {
              if (onExpire) onExpire();
            },
          });
          widgetIdRef.current = id;
        } catch (err) {
          console.error("Error rendering reCAPTCHA:", err);
        }
      }
    };

    // If recaptcha is already loaded in global window
    if (window.grecaptcha && window.grecaptcha.render) {
      renderWidget();
    } else {
      // Load script if not already present in document
      let script = document.querySelector('script[src*="recaptcha/api.js"]');
      if (!script) {
        script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }

      // Register standard onload callback
      window.onRecaptchaLoaded = () => {
        if (isMounted) {
          renderWidget();
        }
      };

      // Periodic check as fallback in case script is already loading
      const interval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          renderWidget();
          clearInterval(interval);
        }
      }, 300);

      return () => {
        clearInterval(interval);
        isMounted = false;
      };
    }

    return () => {
      isMounted = false;
    };
  }, [siteKey, onVerify, onExpire]);

  // Clean up reCAPTCHA on unmount to prevent duplicated elements or memory leaks
  useEffect(() => {
    return () => {
      if (window.grecaptcha && widgetIdRef.current !== null) {
        try {
          // Note: grecaptcha doesn't have an unrender/destroy, but we reset and clear the inner HTML
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (e) {
          // ignore reset errors on unmount
        }
      }
    };
  }, []);

  return (
    <div className="flex justify-center my-4 transition-all duration-300">
      <div ref={containerRef} className="g-recaptcha border border-slate-100 rounded-lg shadow-sm bg-white p-1"></div>
    </div>
  );
}
