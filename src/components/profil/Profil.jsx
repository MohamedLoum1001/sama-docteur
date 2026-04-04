import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./Profil.css";

const Profil = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    photo: ""
  });

  const storedUser = JSON.parse(localStorage.getItem("user"));

  // 1. Récupération des données utilisateur au chargement
  useEffect(() => {
    const fetchUser = async () => {
      if (storedUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", storedUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données:", error);
        }
      }
    };
    fetchUser();
  }, []);

  // 2. Gestion de l'upload de la photo sur Cloudinary + Mise à jour Firestore
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérification des variables d'environnement
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Erreur de configuration Cloudinary. Vérifiez votre fichier .env");
      return;
    }

    setUploading(true);

    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        const newPhotoUrl = data.secure_url;

        // 1. Mettre à jour l'état local (l'avatar change tout de suite à l'écran)
        setUser((prev) => ({ ...prev, photo: newPhotoUrl }));

        // 2. Sauvegarder définitivement l'URL dans Firestore
        await updateDoc(doc(db, "users", storedUser.uid), {
          photo: newPhotoUrl
        });

        alert("Photo de profil mise à jour ! 📸");
      } else {
        throw new Error(data.error?.message || "Échec de l'upload");
      }

    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'upload : " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. Mise à jour des informations textuelles dans Firestore
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", storedUser.uid), {
        prenom: user.prenom,
        nom: user.nom,
        telephone: user.telephone,
        adresse: user.adresse
      });
      alert("Profil mis à jour ✅");
    } catch (error) {
      console.error("Erreur update:", error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profil-container">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-9">

            <div className="text-center mb-4">
              <h3 className="fw-bold text-primary display-6">
                <i className="bi bi-person-circle me-2"></i>Mon profil
              </h3>
            </div>

            <div className="card profil-card shadow-sm border-0 rounded-4 p-4 p-md-5 text-center">

              {/* Section Photo de Profil Dynamique */}
              <div className="mb-5 position-relative d-inline-block mx-auto">
                <div className="profile-image-wrapper shadow-sm">
                  <img
                    src={user.photo ? user.photo : `https://ui-avatars.com/api/?name=${user.prenom}+${user.nom}&background=00a5a8&color=fff`}
                    alt="Profil"
                    className="rounded-circle border border-4 border-white"
                    style={{ width: "130px", height: "130px", objectFit: "cover" }}
                  />
                  {uploading && (
                    <div className="upload-spinner rounded-circle">
                      <div className="spinner-border text-light spinner-border-sm" role="status"></div>
                    </div>
                  )}
                </div>
                <label htmlFor="photoUpload" className="btn-camera shadow">
                  <i className="bi bi-camera-fill"></i>
                  <input
                    type="file"
                    id="photoUpload"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Formulaire des informations */}
              <form onSubmit={handleUpdate}>
                <div className="row g-4 text-start">
                  <div className="col-md-6">
                    <label className="form-label ms-2 fw-semibold text-muted">Prénom</label>
                    <div className="input-group custom-input-group">
                      <input
                        type="text"
                        className="form-control rounded-pill px-3 py-2"
                        value={user.prenom}
                        onChange={(e) => setUser({ ...user, prenom: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label ms-2 fw-semibold text-muted">Nom</label>
                    <div className="input-group custom-input-group">
                      <input
                        type="text"
                        className="form-control rounded-pill px-3 py-2"
                        value={user.nom}
                        onChange={(e) => setUser({ ...user, nom: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label ms-2 fw-semibold text-muted">E-mail</label>
                    <div className="input-group custom-input-group">
                      <input
                        type="email"
                        className="form-control rounded-pill px-3 py-2 bg-light"
                        value={user.email}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label ms-2 fw-semibold text-muted">Téléphone</label>
                    <div className="input-group custom-input-group">
                      <input
                        type="text"
                        className="form-control rounded-pill px-3 py-2"
                        value={user.telephone}
                        onChange={(e) => setUser({ ...user, telephone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label ms-2 fw-semibold text-muted">Adresse</label>
                    <div className="input-group custom-input-group">
                      <input
                        type="text"
                        className="form-control rounded-pill px-3 py-2"
                        value={user.adresse}
                        onChange={(e) => setUser({ ...user, adresse: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <button type="submit" className="btn btn-turquoise w-100 rounded-pill py-3 fw-bold shadow-sm text-white" disabled={loading || uploading} style={{ backgroundColor: "#00a5a8" }}>
                    {loading ? "Mise à jour..." : "Mettre à jour"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;