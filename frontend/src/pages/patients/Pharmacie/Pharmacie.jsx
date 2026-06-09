// src/patients/pharmacie/Pharmacie.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaSearch, FaMapMarkerAlt, FaPills, FaStar } from "react-icons/fa";
import Button from "../../../components/boutons/Button";

const Pharmacie = () => {
    const [medicationSearch, setMedicationSearch] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => console.error("Géolocalisation refusée")
            );
        }
    }, []);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!medicationSearch.trim()) return;

        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "pharmacies"));
            const allPharmacies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // NOUVELLE LOGIQUE DE FILTRAGE : Majuscules et Accents ignorés
            const filtered = allPharmacies
                .filter(pharma =>
                    pharma.stock && pharma.stock.some(item => {
                        // On transforme tout en minuscule et on retire les accents
                        const nomMedicamentBase = item.nom
                            .toLowerCase()
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                        const rechercheUtilisateur = medicationSearch
                            .toLowerCase()
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                        return nomMedicamentBase.includes(rechercheUtilisateur);
                    })
                )
                .map(pharma => {
                    // On fait la même chose pour récupérer le prix correspondant
                    const medInfo = pharma.stock.find(item =>
                        item.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            .includes(medicationSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
                    );

                    let distance = null;
                    if (userLocation && pharma.coordonnees && pharma.coordonnees.latitude) {
                        distance = calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            pharma.coordonnees.latitude,
                            pharma.coordonnees.longitude
                        );
                    }

                    return { ...pharma, medPrice: medInfo ? medInfo.prix : 0, distance };
                });

            // TRI : On met la plus proche en haut de la liste
            const sorted = filtered.sort((a, b) => {
                if (a.distance !== null && b.distance !== null) {
                    return a.distance - b.distance;
                }
                return a.medPrice - b.medPrice;
            });

            setResults(sorted);
        } catch (error) {
            console.error("Erreur recherche pharmacie:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pharmacie-container p-4 mt-20">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <FaPills className="text-teal-500 text-5xl mx-auto mb-3" />
                    <h2 className="text-3xl font-bold text-gray-800">Toutes les pharmacies disponibles</h2>
                    <p className="text-gray-500">Classées par proximité pour vous aider</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 mb-10">
                    <div className="relative flex-grow">
                        <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 shadow-lg focus:border-teal-500 outline-none"
                            placeholder="Rechercher un médicament..."
                            value={medicationSearch}
                            onChange={(e) => setMedicationSearch(e.target.value)}
                        />
                    </div>
                    <Button label="Rechercher" variant="login" type="submit" loading={loading} />
                </form>

                <div className="grid gap-6">
                    {results.length > 0 ? (
                        results.map((pharma, index) => (
                            <div
                                key={pharma.id}
                                className={`p-6 rounded-3xl border-2 flex flex-col md:flex-row justify-between items-center transition-all ${index === 0 && pharma.distance !== null
                                    ? 'border-teal-500 bg-teal-50 shadow-xl ring-2 ring-teal-200'
                                    : 'border-gray-100 bg-white shadow-sm'
                                    }`}
                            >
                                <div className="text-center md:text-left mb-4 md:mb-0">
                                    {index === 0 && pharma.distance !== null && (
                                        <div className="flex items-center gap-2 text-teal-600 font-bold text-sm mb-2">
                                            <FaStar /> OPTION LA PLUS PROCHE
                                        </div>
                                    )}
                                    <h4 className="text-xl font-bold text-gray-800">{pharma.nom}</h4>
                                    <p className="text-gray-500 flex items-center justify-center md:justify-start gap-1">
                                        <FaMapMarkerAlt className="text-red-500" /> {pharma.adresse}
                                    </p>
                                    {pharma.distance !== null && (
                                        <span className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-teal-600 shadow-sm border border-teal-100">
                                            À {pharma.distance.toFixed(1)} km de vous
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="text-2xl font-black text-gray-900 mb-2">
                                        {pharma.medPrice} <small className="text-sm font-normal text-gray-500">CFA</small>
                                    </div>
                                    <Button label="Voir itinéraire" variant="register" className="px-8 shadow-sm" />
                                </div>
                            </div>
                        ))
                    ) : (
                        medicationSearch && !loading && (
                            <div className="text-center py-10 bg-gray-50 rounded-3xl">
                                <p className="text-gray-400">Aucune pharmacie ne propose ce médicament actuellement.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pharmacie;