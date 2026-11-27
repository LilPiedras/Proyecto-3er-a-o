import { Routes, Route } from "react-router-dom";
import Fromc from "../components/forms/LoginForm";
import Fromt from "../components/forms/RegisterForm";
import Home from "../pages/design/Home";
import Program from "../pages/design/Program"
import Contact from "../pages/design/Contact";
import Testimonials from "../pages/design/Testimonials";
import CrudCursos from "../pages/design/CrudCursos";
import About from "../pages/design/About";
import CrudDocentes from "../pages/design/CrudDocentes";
import CrudEstudiantes from "../pages/design/CrudEstudiantes";
import CrudCarrera from "../pages/design/CrudCarrera";
import CrudHorarios from "../pages/design/CrudHorarios";
import CrudSeccion from "../pages/design/CrudSeccion";
import CrudOferta from "../pages/design/CrudOferta";
import CrudModuloMateria from "../pages/design/CrudMateriamodulo";
import CrudMensualidad from "../pages/design/CrudMensualidad";
import Perfil from "../pages/design/Perfil_page";
import CursosDisponibles from "../pages/design/CursosDisponibles";
import SeleccionarRol from "../components/SeleccionarRol";
import CrudPlanEvaluacion from "../pages/design/CrudPlanEvaluacion";
import CrudNotas from "../pages/design/CrudNotas";
import CrudInscripciones from "../pages/design/CrudInscripciones";
import InscripcionEstudiante from "../pages/design/InscripcionEstudiante";
import MiModulo from "../pages/design/MiModulo";
import RecuperarPassword from "../pages/design/RecuperarPassword";
import CrudCarreraModulo from "../pages/design/CrudCarreraModulo";
import ResumenCalificaciones from "../pages/design/ResumenCalificaciones";
import DashboardDocente from "../pages/design/DashboardDocente";
import Auditorias from "../pages/design/Auditorias";
import CrudAsistencia from "../pages/design/CrudAsistencia";
import ResumenAsistencias from "../pages/design/ResumenAsistencias";
import Dashboard from "../pages/design/Dashboard";
import CrudPeriodo from "../pages/design/CrudPeriodo";

const AppRoutes = () => {
  return (
    <main className="flex-1 pt-28 md:pt-24">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/program" element={<Program />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/about" element={<About />} />
        <Route path="/crudcursos" element={<CrudCursos />} />
        <Route path="/cruddocentes" element={<CrudDocentes />} />
        <Route path="/crudestudiantes" element={<CrudEstudiantes />} />
        <Route path="/crudcarrera" element={<CrudCarrera />} />
        <Route path="/crudhorarios" element={<CrudHorarios />} />
        <Route path="/crudseccion" element={<CrudSeccion />} />
        <Route path="/crudoferta" element={<CrudOferta />} />
        <Route path="/crudmodulomateria" element={<CrudModuloMateria />} />
        <Route path="/crudplanevaluacion" element={<CrudPlanEvaluacion />} />
        <Route path="/crudnotas" element={<CrudNotas />} />
        <Route path="/crudmensualidad" element={<CrudMensualidad />} />
        <Route path="/cursosdisponibles" element={<CursosDisponibles />} />
        <Route path="/crudinscripciones" element={<CrudInscripciones />} />
        <Route path="/estado-inscripcion" element={<InscripcionEstudiante />} />
        <Route path="/mi-modulo" element={<MiModulo />} />
        <Route path="/crudcarreramodulo" element={<CrudCarreraModulo />} />
        <Route path="/resumen-calificaciones" element={<ResumenCalificaciones />} />
        <Route path="/dashboard-docente" element={<DashboardDocente/>} />
        <Route path="/auditorias" element={<Auditorias />} />
        <Route path="/crudasistencia" element={<CrudAsistencia />} />
        <Route path="/resumenasistencias" element={<ResumenAsistencias/>} />
        <Route path="/dashboardgerencia" element={<Dashboard/>} />
        <Route path="/periodos" element={<CrudPeriodo/>} />
      
        <Route path="/perfil" element={<Perfil />} />
        
        <Route path="/recuperar-password" element={<RecuperarPassword />} />

        <Route path="/registro" element={<Fromt />} />
        <Route path="/seleccionar-rol" element={<SeleccionarRol />} />

        <Route path="/login" element={
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-black">
              <Fromc />
            </div>
            <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center bg-linear-to-tr from-yellow-200 via-yellow-500 to-black overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-60 h-60 bg-[url('/img/Logo.png')] bg-cover rounded-full shadow-xl" />
              </div>
            </div>
          </div>
        } />
      </Routes>
    </main>
  );
};

export default AppRoutes;