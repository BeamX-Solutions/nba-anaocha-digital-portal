import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import nbaLogo from "@/assets/nba-logo.png";

const SplashScreen = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Start fade out after auth resolves
      setFadeOut(true);
      const timer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <>
      {children}
      {visible && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary transition-opacity duration-400 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            <img
              src={nbaLogo}
              alt="NBA Anaocha"
              className="h-24 w-24 animate-pulse"
            />
            <div className="text-center">
              <h1 className="font-heading text-2xl font-bold text-primary-foreground">
                NBA Anaocha
              </h1>
              <p className="text-primary-foreground/60 text-sm mt-1">Digital Portal</p>
            </div>
            <div className="flex gap-1.5 mt-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SplashScreen;
