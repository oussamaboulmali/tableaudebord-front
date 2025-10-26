import "../../assets/styles/footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          Copyright © {currentYear} Algérie Presse Service - Tous droits
          réservés
        </div>
      </div>
    </footer>
  );
};

export default Footer;
