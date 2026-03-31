// src/patients/disponibilites/Disponibilites.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../../firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

const joursDisponibles = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

// ✅ Formatage des heures en français
function formatHeure(heure) {
  if (!heure) return "";
  if (/^\d{2}:\d{2}$/.test(heure)) return heure;
  try {
    const d = new Date(`1970-01-01T${heure}`);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    return heure;
  }
}

// ✅ Formatage des dates en français
function formatDateFr(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
}

const Disponibilites = () => {
  const [horaires, setHoraires] = useState([]);
  const [form, setForm] = useState({
    jour: "",
    heureDebut: "",
    heureFin: "",
    date: "",
    type: "jour",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState({
    jour: "",
    heureDebut: "",
    heureFin: "",
    date: "",
    type: "jour",
  });

  const [nomMedecin, setNomMedecin] = useState("Médecin inconnu");
  const [role, setRole] = useState("");

  // Charger le rôle et nom du médecin
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setNomMedecin(data.nom || "Médecin inconnu");
        setRole(data.role || "");
      }
    };

    fetchUserData();
  }, []);

  // Charger ses disponibilités
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "disponibilites", user.uid);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setHoraires(snapshot.data().horaires || []);
      } else {
        setHoraires([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const saveHoraires = async (newHoraires) => {
    const user = auth.currentUser;
    if (!user || role !== "medecin") return;

    await setDoc(doc(db, "disponibilites", user.uid), {
      idMedecin: user.uid,
      nomMedecin: nomMedecin,
      horaires: newHoraires,
      updatedAt: serverTimestamp(),
    });
  };

  const ajouterHoraire = async () => {
    if (role !== "medecin") {
      alert("Seuls les médecins peuvent ajouter des disponibilités.");
      return;
    }

    if (
      (form.type === "jour" && !form.jour) ||
      !form.heureDebut ||
      !form.heureFin ||
      !form.date
    ) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const newHoraires = [...horaires, { ...form }];
    setForm({ jour: "", heureDebut: "", heureFin: "", date: "", type: "jour" });
    await saveHoraires(newHoraires);
  };

  const supprimerHoraire = async (index) => {
    const newHoraires = horaires.filter((_, i) => i !== index);
    await saveHoraires(newHoraires);
  };

  const activerEdition = (index) => {
    setEditIndex(index);
    setEditForm({ ...horaires[index] });
  };

  const sauvegarderEdition = async (index) => {
    if (
      (editForm.type === "jour" && !editForm.jour) ||
      !editForm.heureDebut ||
      !editForm.heureFin ||
      !editForm.date
    ) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    const newHoraires = [...horaires];
    newHoraires[index] = { ...editForm };
    await saveHoraires(newHoraires);
    setEditIndex(null);
    setEditForm({
      jour: "",
      heureDebut: "",
      heureFin: "",
      date: "",
      type: "jour",
    });
  };

  const annulerEdition = () => {
    setEditIndex(null);
    setEditForm({
      jour: "",
      heureDebut: "",
      heureFin: "",
      date: "",
      type: "jour",
    });
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="card shadow-lg border-0 rounded-4 mb-5">
          <div className="card-body">
            <h5 className="card-title text-secondary fw-bold mb-3">
              🗓️ Disponibilités
            </h5>
            <p className="text-muted mb-3">
              👨‍⚕️ Médecin : <strong>{nomMedecin}</strong>
            </p>

            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>📅 Date</th>
                  <th>Type</th>
                  <th>Jour</th>
                  <th>🕒 Début</th>
                  <th>🕒 Fin</th>
                  <th>🛠️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {horaires.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      Aucune disponibilité définie.
                    </td>
                  </tr>
                )}
                {horaires.map((horaire, i) => (
                  <tr key={i}>
                    {editIndex === i ? (
                      <>
                        <td>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.date}
                            onChange={(e) =>
                              setEditForm({ ...editForm, date: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={editForm.type}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                type: e.target.value,
                                jour: "",
                              })
                            }
                          >
                            <option value="jour">Jour spécifique</option>
                            <option value="semaine">Toute la semaine</option>
                            <option value="mois">Tout le mois</option>
                          </select>
                        </td>
                        <td>
                          {editForm.type === "jour" ? (
                            <select
                              className="form-select"
                              value={editForm.jour}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  jour: e.target.value,
                                })
                              }
                            >
                              <option value="">Jour</option>
                              {joursDisponibles.map((jour) => (
                                <option key={jour} value={jour}>
                                  {jour}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control"
                            value={editForm.heureDebut}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                heureDebut: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control"
                            value={editForm.heureFin}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                heureFin: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => sauvegarderEdition(i)}
                          >
                            ✅ Enregistrer
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={annulerEdition}
                          >
                            ❌ Annuler
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* ✅ Format date et heures en français */}
                        <td>{formatDateFr(horaire.date)}</td>
                        <td>
                          {horaire.type === "semaine"
                            ? "Toute la semaine"
                            : horaire.type === "mois"
                            ? "Tout le mois"
                            : "Jour spécifique"}
                        </td>
                        <td>
                          {horaire.type === "jour" ? (
                            horaire.jour
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{formatHeure(horaire.heureDebut)}</td>
                        <td>{formatHeure(horaire.heureFin)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => activerEdition(i)}
                          >
                            Modifier
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => supprimerHoraire(i)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Ajout d’une nouvelle dispo */}
            {role === "medecin" && (
              <>
                <h6 className="mt-4 fw-semibold">
                  ➕ Ajouter une disponibilité
                </h6>
                <div className="row g-3 align-items-center mt-2">
                  <div className="col-md-3">
                    <select
                      className="form-select rounded-3 mb-2"
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value, jour: "" })
                      }
                    >
                      <option value="jour">Jour spécifique</option>
                      <option value="semaine">Toute la semaine</option>
                      <option value="mois">Tout le mois</option>
                    </select>
                    {form.type === "jour" && (
                      <select
                        className="form-select rounded-3 mt-2"
                        value={form.jour}
                        onChange={(e) =>
                          setForm({ ...form, jour: e.target.value })
                        }
                      >
                        <option value="">Jour</option>
                        {joursDisponibles.map((jour) => (
                          <option key={jour} value={jour}>
                            {jour}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="col-md-3">
                    <input
                      type="date"
                      className="form-control rounded-3 mb-2"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                    />
                    <input
                      type="time"
                      className="form-control rounded-3"
                      value={form.heureDebut}
                      onChange={(e) =>
                        setForm({ ...form, heureDebut: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <input
                      type="time"
                      className="form-control rounded-3"
                      value={form.heureFin}
                      onChange={(e) =>
                        setForm({ ...form, heureFin: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <button
                      className="btn btn-custom mt-3 rounded-pill w-100"
                      type="button"
                      onClick={ajouterHoraire}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disponibilites;
