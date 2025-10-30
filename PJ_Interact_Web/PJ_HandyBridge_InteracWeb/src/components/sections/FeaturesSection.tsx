// FeaturesSection.tsx
export const FeaturesSection: React.FC = () => {
  const images = [
    "/images/features/feature1.png",
    "/images/features/feature2.png",
    "/images/features/feature3.png",
    "/images/features/feature4.png",
    "/images/features/feature5.png",
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        {[...images, ...images].map((img, i) => (
          <div
            key={i}
            className="feature-card"
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </div>
    </section>
  );
};
