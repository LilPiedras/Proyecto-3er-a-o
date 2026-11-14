import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';
import { BookOpen, Users, CheckCircle, Award, Clock } from 'lucide-react';

const DashboardDocente = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [misAsignaciones, setMisAsignaciones] = useState([]);
  const [ciDocente, setCiDocente] = useState('');

  useEffect(() => {
    const ci = localStorage.getItem("ciuser") || localStorage.getItem("ciempleado") || "V-12333444";
    setCiDocente(ci);

    if (ci) {
      cargarCargaAcademica(ci);
    } else {
      setCargando(false);
    }
  }, []);

  const cargarCargaAcademica = async (ci) => {
    try {
      setCargando(true);
      const res = await api.get('/api/horarios-materias').catch(() => api.get('/horarios-materias').catch(() => ({ data: [] })));
      const listaAsignaciones = Array.isArray(res.data) ? res.data : (res.data?.data || Object.values(res.data || {}).find(v => Array.isArray(v)) || []);

      // Filtro para matricular la cédula del docente con las asignaciones devueltas
      const misClases = listaAsignaciones.filter(item => {
        if (!item || typeof item !== 'object') return false;
        const itemCi = String(item.ciempleado || item.cedula || item.ci || item.docente_ci || "").trim();
        const itemDocenteTexto = String(item.docente || item.nombreempleado || "").trim();
        return itemCi === String(ci).trim() || itemDocenteTexto.toLowerCase().includes(String(ci).toLowerCase());
      });

      setMisAsignaciones(misClases);
    } catch (error) {
      console.error("Error al cargar carga académica:", error);
      show_alert("No se pudo cargar tu información docente", "error");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando tu panel docente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 pt-28 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Cabecera de Bienvenida */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-3">
              <BookOpen size={30} /> Panel Académico del Docente
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Bienvenido. Desde aquí puedes visualizar tus secciones activas, gestionar asistencias y evaluar calificaciones rápidamente.
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl text-xs font-mono text-gray-300">
            Cédula Docente: <span className="text-yellow-400 font-bold">{ciDocente}</span>
          </div>
        </div>

        {/* Listado de Secciones y Materias Asignadas */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-yellow-400" size={20} /> Secciones y Aulas Asignadas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {misAsignaciones.length > 0 ? (
              misAsignaciones.map((item, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-4 hover:border-yellow-400/50 transition">
                  <div className="flex justify-between items-start">
                    <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-xs px-3 py-1 rounded-full font-bold">
                      Módulo: {item.modulo || item.nombremodulo || "General"}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={14} /> {item.horainicio || ""} - {item.horafin || ""}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{item.materia || item.nombremateria || "Materia Asignada"}</h3>
                    <p className="text-xs text-yellow-300 mt-1">
                      Salón: {item.salon || "S/N"} | Día: {item.dia || "Por definir"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                    <button
                      onClick={() => navigate('/crud-asistencia')}
                      className="bg-gray-800 hover:bg-yellow-400 hover:text-black text-gray-200 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle size={14} /> Asistencia
                    </button>
                    <button
                      onClick={() => navigate('/crud-notas')}
                      className="bg-gray-800 hover:bg-yellow-400 hover:text-black text-gray-200 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award size={14} /> Notas
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-gray-900 rounded-2xl border border-gray-800 text-gray-400">
                <p className="text-base font-semibold">No se encontraron asignaciones activas para la cédula {ciDocente}.</p>
                <p className="text-xs text-gray-500 mt-1">Verifica en el panel de Oferta / Asignación que el docente esté correctamente vinculado.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardDocente;