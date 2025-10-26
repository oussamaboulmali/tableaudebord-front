import { Outlet } from "react-router-dom";
import "../../assets/styles/login.css";
import ApsLogo from "../../assets/images/logos/logo-aps-rect.png";
import AproposImage from "../../assets/images/apropos.png";

export default function Index() {
  return (
    <div className="login-container">
      {/* Section gauche - Image */}
      <div
        className="login-left"
        style={{ backgroundImage: `url(${AproposImage})` }}
      >
        <div className="login-left-overlay"></div>
        <div className="login-left-grid"></div>

        <div className="login-left-content">
          <div className="left-badge">
            <span>Plateforme Rédactionnelle</span>
          </div>

          <h1>Votre espace de travail professionnel</h1>
          <p>
            Gérez vos contenus rédactionnels en toute simplicité avec notre
            plateforme moderne et sécurisée.
          </p>
        </div>

        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
      </div>

      {/* Section droite - Formulaire */}
      <div className="login-right">
        <div className="login-right-grid"></div>

        <div className="login-form-container">
          <div className="login-header">
            <img src={ApsLogo} alt="Logo APS" className="login-logo" />
            <h2>Connexion</h2>
            <p>Bienvenue dans votre espace rédactionnel</p>
          </div>
          <Outlet />
          <div className="login-footer">
            <p>Besoin d’aide ? Contactez le support</p>
          </div>
        </div>

        <div className="floating-shape shape-3"></div>
      </div>
    </div>
  );
}
