import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Layers, Wallet, BarChart3, RefreshCw } from 'lucide-react';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const Dashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  const idrol = Number(localStorage.getItem('idrol'));
  const puedeVer = [1, 2, 3].includes(idrol);
  const puedeVerMensualidades = [1, 2].includes(idrol);

  const cargarDashboard = async () => {
    if (!puedeVer) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get('/dashboard/resumen');
      setResumen(data);
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error al cargar los indicadores del dashboard',
        'error'
      );
      setResumen(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, [puedeVer]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando dashboard...</p>
      </div>
    );
  }

  if (!puedeVer) {
    return (
      <div className="p-6 min-h-screen bg-black text-white pt-24">
        <div className="container mx-auto max-w-4xl bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">Acceso restringido</h2>
          <p className="text-gray-400">Tu rol actual no tiene permisos para ver el dashboard.</p>
        </div>
      </div>
    );
  }

  const totalEstudiantes = resumen?.total_estudiantes ?? 0;
  const totalDocentes = resumen?.total_docentes ?? 0;
  const totalModulos = resumen?.total_modulos ?? 0;
  const modulosLista = Array.isArray(resumen?.estudiantes_por_modulo)
    ? resumen.estudiantes_por_modulo
    : [];
  const maxCantidadModulo = Math.max(
    1,
    ...modulosLista.map((item) => Number(item.cantidad) || 0)
  );

  const mensualidades = resumen?.mensualidades;
  const totalPagados = mensualidades?.pagados ?? 0;
  const totalPendientes = mensualidades?.pendientes ?? 0;
  const totalRegistrosMensualidad = Math.max(1, totalPagados + totalPendientes);
  const porcentajePagados = Math.round((totalPagados / totalRegistrosMensualidad) * 100);
  const porcentajePendientes = Math.round((totalPendientes / totalRegistrosMensualidad) * 100);

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-1">
              Panel de Indicadores
            </h2>
            <p className="text-gray-400 text-sm">
              {puedeVerMensualidades
                ? 'Resumen general de la academia y control operativo'
                : 'Resumen académico general del sistema (solo consulta)'}
            </p>
          </div>

          <button
            type="button"
            onClick={cargarDashboard}
            className="bg-gray-800 text-yellow-400 border border-gray-600 font-bold px-4 py-2.5 rounded-lg hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            puedeVerMensualidades ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          } gap-4 mb-6`}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase text-gray-400">Estudiantes activos</p>
              <Users size={20} className="text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">{totalEstudiantes}</p>
            <p className="text-xs text-gray-500 mt-1">Matrícula vigente</p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase text-gray-400">Personal / Docentes</p>
              <UserCheck size={20} className="text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalDocentes}</p>
            <p className="text-xs text-gray-500 mt-1">Equipo registrado</p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase text-gray-400">Módulos activos</p>
              <Layers size={20} className="text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalModulos}</p>
            <p className="text-xs text-gray-500 mt-1">Estructura académica</p>
          </div>

          {puedeVerMensualidades && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase text-gray-400">Monto recaudado</p>
                <Wallet size={20} className="text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-yellow-400">
                ${Number(mensualidades?.monto_recaudado ?? 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {mensualidades?.total_registros ?? 0} registros en total
              </p>
            </div>
          )}
        </div>

        <div
          className={`grid grid-cols-1 ${
            puedeVerMensualidades ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
          } gap-6`}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-yellow-400" />
              <h3 className="text-xl font-bold text-white">
                Participación por módulo
              </h3>
            </div>

            {modulosLista.length > 0 ? (
              <div className="space-y-4">
                {modulosLista.map((item, idx) => {
                  const cant = Number(item.cantidad) || 0;
                  const ancho = Math.min(100, Math.round((cant / maxCantidadModulo) * 100));

                  return (
                    <div key={`${item.modulo}-${idx}`}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-200">{item.modulo}</span>
                        <span className="font-mono text-yellow-400">{cant}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <div
                          className="h-full bg-yellow-400 transition-all duration-300"
                          style={{ width: `${ancho}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-8 text-center">
                No hay datos de módulos para mostrar.
              </p>
            )}
          </div>

          {puedeVerMensualidades && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Estado de mensualidades
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-400 mb-1">Pagadas / Solventes</p>
                  <p className="text-2xl font-bold text-green-400">{totalPagados}</p>
                </div>
                <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-400 mb-1">Pendientes</p>
                  <p className="text-2xl font-bold text-red-400">{totalPendientes}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Proporción al día</span>
                    <span className="font-mono text-green-400">{porcentajePagados}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${porcentajePagados}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Proporción pendiente</span>
                    <span className="font-mono text-red-400">{porcentajePendientes}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <div
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${porcentajePendientes}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;