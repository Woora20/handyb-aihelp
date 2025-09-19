// src/components/sections/PartnersSection.tsx
import React from "react";
import partner1 from "../../assets/images/partners/kku-logo.png";
import partner2 from "../../assets/images/partners/deaf-association.png";
import partner3 from "../../assets/images/partners/dep-logo.png";

export const PartnersSection: React.FC = () => {
  const partners = [
    { id: 1, logo: partner1, alt: "KKU - Khon Kaen University" },
    {
      id: 2,
      logo: partner2,
      alt: "National Association of the Deaf in Thailand",
    },
    { id: 3, logo: partner3, alt: "Department of Empowerment" },
  ];

  const allPartners = [...partners, ...partners];

  return (
    <section className="partners-section">
      <div className="partners-wrapper">
        <h2 className="partners-title">
          <span>ส่งเสริมศักยภาพผู้เรียน</span>
        </h2>
        <div className="partners-container">
          <div className="partners-track">
            {allPartners.map((partner, index) => (
              <div key={`${partner.id}-${index}`} className="partner-item">
                <img
                  src={partner.logo}
                  alt={partner.alt}
                  className="partner-logo"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
