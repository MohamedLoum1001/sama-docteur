import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="p-4">
      <h3 className="mb-4 text-xl font-semibold">📊 Tableau de bord</h3>

      {/* Dashboard Cards */}
      <div className="row">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title">Utilisateurs</h5>
              <p className="card-text fs-4">150</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h5 className="card-title">Médecins</h5>
              <p className="card-text fs-4">40</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-info mb-3">
            <div className="card-body">
              <h5 className="card-title">Patients</h5>
              <p className="card-text fs-4">110</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Cards */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-white bg-danger mb-3">
            <div className="card-body">
              <h5 className="card-title">Dentistes</h5>
              <p className="card-text fs-4">12</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-warning mb-3">
            <div className="card-body">
              <h5 className="card-title">Cardiologues</h5>
              <p className="card-text fs-4">8</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-secondary mb-3">
            <div className="card-body">
              <h5 className="card-title">Dermatologues</h5>
              <p className="card-text fs-4">6</p>
            </div>
          </div>
        </div>
      </div>

      {/* Other Cards */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">Gestion des utilisateurs</h5>
              <p>
                Gérez les comptes des patients et médecins, créez, modifiez ou
                supprimez les profils.
              </p>
              <Link to="/utilisateurs" className="btn btn-primary">
                Voir plus
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">Validation des médecins</h5>
              <p>
                Validez l'inscription des médecins et vérifiez leurs
                qualifications avant activation.
              </p>
              <Link to="/validations" className="btn btn-primary">
                Voir plus
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">Rapports & Statistiques</h5>
              <p>
                Générez des rapports sur les consultations, paiements et
                l’utilisation de la plateforme.
              </p>
              <Link to="/rapports" className="btn btn-primary">
                Voir plus
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
