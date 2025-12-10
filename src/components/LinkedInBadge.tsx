import React from "react";

export default function LinkedInBadge(): React.ReactElement {
  React.useEffect(() => {
    // Reinitialize LinkedIn badges when component mounts
    if ((window as any).LI) {
      (window as any).LI.parse();
    }
  }, []);

  return (
    <div className="flex justify-center">
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
