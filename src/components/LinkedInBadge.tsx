import React from "react";
import { Linkedin } from "lucide-react";

declare global {
  interface Window {
    LI?: {
      parse: () => void;
    };
  }
}

export default function LinkedInBadge(): React.ReactElement {
  const [scriptLoaded, setScriptLoaded] = React.useState(false);

  React.useEffect(() => {
    // Wait a bit for LinkedIn script to load, then parse badges
    const checkAndParse = () => {
      if (window.LI) {
        window.LI.parse();
        setScriptLoaded(true);
      } else {
        // Retry after a delay if LI is not available yet
        setTimeout(checkAndParse, 500);
      }
    };

    checkAndParse();
  }, []);

  // Fallback UI if LinkedIn script doesn't load
  if (!scriptLoaded) {
    return (
      <a
        href="https://ke.linkedin.com/in/wiltord-ichingwa?trk=profile-badge"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center p-6 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <Linkedin className="h-12 w-12 text-blue-600 mb-3" />
        <span className="font-semibold text-slate-900 dark:text-white">
          Wiltord Ichingwa
        </span>
        <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          LinkedIn Profile
        </span>
      </a>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <div
        className="badge-base LI-profile-badge"
        data-locale="en_US"
        data-size="medium"
        data-theme="dark"
        data-type="VERTICAL"
        data-vanity="wiltord-ichingwa"
        data-version="v1"
      >
        <a
          className="badge-base__link LI-simple-link"
          href="https://ke.linkedin.com/in/wiltord-ichingwa?trk=profile-badge"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wiltord Ichingwa
        </a>
      </div>
    </div>
  );
}
