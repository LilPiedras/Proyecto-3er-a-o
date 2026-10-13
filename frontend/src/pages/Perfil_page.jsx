import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Perfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const tokenData = localStorage.getItem("usuario") || localStorage.getItem("access_token") || localStorage.getItem("token");
        
        let token = "";
        if (tokenData) {
          try {
            const parsed = JSON.parse(tokenData);
            token = parsed.access_token || parsed.token || (typeof parsed === 'string' ? parsed : tokenData);
          } catch (e) {
            token = tokenData;
          }
        }

        const response = await axios.get("/api/api/perfil/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setPerfil(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError("No se pudieron cargar los datos del perfil.");
        setLoading(false);
      }
    };

    obtenerPerfil();
  }, []);

  const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre.charAt(0) : '';
    const a = apellido ? apellido.charAt(0) : '';
    return (n + a).toUpperCase() || 'U';
  };

  const getRoleName = (idrol) => {
    switch (idrol) {
      case 1:
      case 2:
      case 3: return 'Personal Administrativo';
      case 4: return 'Docente';
      case 5: return 'Estudiante';
      default: return `Rol ID: ${idrol}`;
    }
  };

  return (
    /* Contenedor general de la página con fondo amarillo oscuro / tostado elegante */
    <div className="min-h-[80vh] w-full bg-[#1c180e] flex justify-center items-center py-12 px-4">
      {/* Tarjeta flotante con fondo oscuro y bordes estilizados */}
      <div className="w-full max-w-xl bg-[#11141d] border border-[#2b2518] rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Cabecera sutil */}
        <div className="h-28 bg-[#181d28] border-b border-[#232936] relative flex items-end justify-center">
          
          {/* Avatar Circular con Iniciales */}
          <div className="absolute -bottom-8 w-20 h-20 rounded-2xl bg-[#0f121a] border-4 border-[#11141d] flex items-center justify-center shadow-lg">
            <span className="text-2xl font-black text-[#fbbf24] tracking-wider">
              {perfil ? getInitials(perfil.nombre || perfil.nombreusuario, perfil.apellido || perfil.apellusuario) : '...'}
            </span>
          </div>
        </div>

        {/* Contenido de la tarjeta */}
        <div className="pt-12 pb-8 px-8 text-center">
          {loading ? (
            <div className="py-10">
              <div className="inline-block w-7 h-7 border-3 border-[#fbbf24] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-400 text-sm">Cargando perfil...</p>
            </div>
          ) : error ? (
            <p className="text-red-400 font-medium py-6 bg-red-950/20 rounded-xl border border-red-900/40">{error}</p>
          ) : (
            perfil && (
              <div>
                <h2 className="text-3xl font-bold text-gray-100 mb-1">
                  {perfil.nombre || perfil.nombreusuario} {perfil.apellido || perfil.apellusuario}
                </h2>
                
                <div className="flex justify-center items-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] text-xs font-semibold rounded-full">
                    {getRoleName(perfil.idrol)}
                  </span>
                  {perfil.activo_detalle !== undefined && (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${perfil.activo_detalle ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${perfil.activo_detalle ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                      {perfil.activo_detalle ? 'Activo' : 'Inactivo'}
                    </span>
                  )}
                </div>

                {/* Lista de detalles limpia con tonos grises y acentos amarillos */}
                <div className="grid grid-cols-1 gap-2.5 text-left bg-[#161a25] border border-[#252c3d] rounded-2xl p-4">
                  
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1c2230] transition-colors border-b border-[#202736]">
                    <span className="text-x uppercase tracking-wider text-gray-400 font-semibold">Cédula / ID</span>
                    <span className="text-gray-200 font-medium text-x">{perfil.cedula || perfil.ciuser}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1c2230] transition-colors border-b border-[#202736]">
                    <span className="text-x uppercase tracking-wider text-gray-400 font-semibold">Correo Electrónico</span>
                    <span className="text-gray-200 font-medium text-x">{perfil.correo || perfil.correousuario}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1c2230] transition-colors border-b border-[#202736]">
                    <span className="text-x uppercase tracking-wider text-gray-400 font-semibold">Teléfono</span>
                    <span className="text-gray-200 font-medium text-x">{perfil.telefono || perfil.teleusuario || "No registrado"}</span>
                  </div>

                  {perfil.cargo && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1c2230] transition-colors border-b border-[#202736]">
                      <span className="text-x uppercase tracking-wider text-gray-400 font-semibold">Cargo</span>
                      <span className="text-[#fbbf24] font-medium text-x">{perfil.cargo}</span>
                    </div>
                  )}

                  {perfil.fecha_contrato && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1c2230] transition-colors">
                      <span className="text-x uppercase tracking-wider text-gray-400 font-semibold">Fecha de Contrato</span>
                      <span className="text-gray-200 font-medium text-x">{perfil.fecha_contrato}</span>
                    </div>
                  )}

                </div>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};

export default Perfil;