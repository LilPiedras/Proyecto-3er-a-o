from pydantic import BaseModel, ConfigDict, Field, model_validator

class Detalle_InscripcionSalidad(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    inscripcion_periodo_id : int
    seccion_id : int
    

class Detalle_InscripcionEntrada(BaseModel):
    inscripcion_periodo_id: int = Field(gt=0)
    seccion_id: int = Field(gt=0)
    
    

class Detalle_InscripcionActualizar(BaseModel):
    inscripcion_periodo_id: int | None = Field(default=None, gt=0)
    seccion_id: int | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def validar_campos(self):
        if not self.model_fields_set:
            raise ValueError("Debe indicar al menos un campo para actualizar")
        if any(getattr(self, campo) is None for campo in self.model_fields_set):
            raise ValueError("Los campos enviados para actualizar no pueden ser nulos")
        return self