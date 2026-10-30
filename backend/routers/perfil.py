from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database.connection import get_db
from models.usuario_model import Usuario
<<<<<<< HEAD
from models.user_login_model import UserLogin  # <--- Importante para buscar el rol
=======
>>>>>>> 49b812ced42dcb2b4e451415474e74cf6a65e3ac
from tokensitos.auth_depencias import VerificarRoles

perfil_router = APIRouter(prefix="/api/perfil", tags=["Perfil"])

@perfil_router.get("/", status_code=status.HTTP_200_OK)
def obtener_perfil_usuario(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3, 4, 5]))
):
<<<<<<< HEAD
    # Consultar el rol activo del usuario en la tabla user_login
    user_login_record = db.query(UserLogin).filter(
        UserLogin.ciuser == current_user.ciuser, 
        UserLogin.activo == True
    ).first()
    
    # Extraer el idrol o asignar null si no se encuentra
    idrol = user_login_record.idrol if user_login_record else None
=======
    # Obtenemos el idrol directamente del objeto Usuario
    idrol = getattr(current_user, "idrol", None)
>>>>>>> 49b812ced42dcb2b4e451415474e74cf6a65e3ac
    
    base_data = {
        "ciuser": current_user.ciuser,
        "nombreusuario": current_user.nombreusuario,
        "apellusuario": current_user.apellusuario,
        "correousuario": current_user.correousuario,
        "teleusuario": current_user.teleusuario,
        "idrol": idrol
    }

    if idrol == 5 and current_user.estudiante:
        query_estudiante = text("""
            SELECT ciestu, nombreestu, apelliestu, correoestu, teleestu, activo
            FROM public.estudiante
            WHERE ciestu = :cedula
        """)
        res = db.execute(query_estudiante, {"cedula": current_user.estudiante}).fetchone()
        if res:
            base_data.update({
                "cedula": res[0],
                "nombre": res[1],
                "apellido": res[2],
                "correo": res[3],
                "telefono": res[4],
                "activo_detalle": res[5]
            })

    elif current_user.empleado:
        query_empleado = text("""
            SELECT ciempleado, nombreempleado, apellidoempleado, correoempleado, telefempleado, fechacontra, cargo, activo
            FROM public.empleado
            WHERE ciempleado = :cedula
        """)
        res = db.execute(query_empleado, {"cedula": current_user.empleado}).fetchone()
        if res:
            base_data.update({
                "cedula": res[0],
                "nombre": res[1],
                "apellido": res[2],
                "correo": res[3],
                "telefono": res[4],
                "fecha_contrato": res[5],
                "cargo": res[6],
                "activo_detalle": res[7]
            })

    return base_data