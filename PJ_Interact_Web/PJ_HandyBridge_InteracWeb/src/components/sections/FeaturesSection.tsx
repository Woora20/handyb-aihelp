// FeaturesSection.tsx
import feature1 from "../../assets/images/features/feature1.png";
import feature2 from "../../assets/images/features/feature2.png";
import feature3 from "../../assets/images/features/feature3.png";
import feature4 from "../../assets/images/features/feature4.png";
import feature5 from "../../assets/images/features/feature5.png";

export const FeaturesSection: React.FC = () => {
  const images = [feature1, feature2, feature3, feature4, feature5];

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
