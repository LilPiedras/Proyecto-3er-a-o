from fastapi import FastAPI
from database.connection import engine
from models.base import Base

from models.seccion_model import Seccion
from models.asistencia_model import Asistencias
from models.asignacion_docente_model import Asignacion_Docente
from models.preguntas_usuario_model import Preguntas_Usuario
from models.mensualidad_estu_model import Mensualidad_estu
from models.empleado_model import Empleado
from models.estudiante_model import Estudiante
from models.usuario_model import Usuario
from models.bloque_model import Bloque
from models.curso_model import Curso
from models.materias_model import Materias
from models.curso_modulo_model import CursoModulo
from models.modulo_model import Modulo
from models.horarios_model import Horario
from models.notas_model import Notas
from models.mensualidad_model import Mensualidad
from models.moneda_pago_model import MonedaPago
from models.metodo_pago_model import MetodoPago
from models.preguntas_seguridad_model import PreguntasSeguridad
from models.token_model import RefreshToken
from models.carrera_model import Carrera
from models.oferta_seccion_model import Oferta_seccion
from models.materias_modulo_model import Materias_Modulo
from models.carrera_modulo_model import Carrera_Modulo
from models.user_login_model import UserLogin
from models.usuario_model import Usuario
from models.rol_model import Rol
from models.auditoria_model import Auditoria

Base.metadata.create_all(bind=engine)

from routers.RouteEstu import estudiante_router
from routers.empleado_router import empleado_router
from routers.RouteUsuario import usuario_router
from routers.RouteRol import rol_route
from routers.RouteNota import notas_route
from routers.RouteBloque import bloque_route
from routers.RouteCM import curso_m_route
from routers.RouteMonte import mensualidad_route
from routers.RouteMaterias import materia_route
from routers.RouteHorario import horario_route
from routers.RouteMoPa import metodo_route
from routers.RouteMP import monedas_route
from routers.RoutePreSeg import pregunta_route
from routers.RouteSeccion import seccion_router
from routers.routeCurso import curso_route
from routers.routeModulo import modulo_route
from tokensitos.auth_router import router as auth_router
from routers.RouteCarrera import carrera_route
from routers.RouteOferta import oferta_router
from routers.RouteModulo_Materia import modulo_materia_route
from routers.RouteCarreraModulo import modulo_carrera_route
from routers.RouteUsuarioLogin import usuariolog_router
from routers.auditoria_router import auditoria_router
from analitics.kpi import router as analitics_router 


app = FastAPI()
app.include_router(estudiante_router)
app.include_router(empleado_router)
app.include_router(usuario_router)
app.include_router(rol_route)
app.include_router(notas_route)
app.include_router(bloque_route)
app.include_router(curso_m_route)
app.include_router(materia_route)
app.include_router(horario_route)
app.include_router(mensualidad_route)
app.include_router(monedas_route)
app.include_router(metodo_route)
app.include_router(pregunta_route)
app.include_router(seccion_router)
app.include_router(curso_route)
app.include_router(modulo_route)
app.include_router(auth_router)
app.include_router(carrera_route)
app.include_router(oferta_router)
app.include_router(modulo_materia_route)
app.include_router(modulo_carrera_route)
app.include_router(usuariolog_router)
app.include_router(auditoria_router)
app.include_router(analitics_router)

@app.get("/")
def index():
    return "bienvenido joven"


