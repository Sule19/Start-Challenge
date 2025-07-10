from fastapi import FastAPI, HTTPException, Response
from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Union
import uvicorn

app = FastAPI(title="Mock Settings API", version="1.0.0")

# In-memory storage for mock settings
mock_settings_storage: List[Dict[str, Any]] = []

class MockSettings(BaseModel):
    ruta: str = Field(..., description="API route path")
    metodo: str = Field(..., description="HTTP method")
    parametros_url: Dict[str, Any] = Field(default_factory=dict, description="URL parameters")
    parametros_body: Dict[str, Any] = Field(default_factory=dict, description="Body parameters")
    headers: Dict[str, Any] = Field(default_factory=dict, description="HTTP headers")
    codigo_estado: int = Field(..., ge=100, le=599, description="HTTP status code")
    contenido_respuesta: Union[Dict[str, Any], str] = Field(..., description="Response content")
    content_type: str = Field(default="application/json", description="Content type")

    class Config:
        json_schema_extra = {
            "example": {
                "ruta": "/api/saludo",
                "metodo": "GET",
                "parametros_url": {},
                "parametros_body": {},
                "headers": {},
                "codigo_estado": 200,
                "contenido_respuesta": {
                    "mensaje": "Hola desde el mock"
                },
                "content_type": "application/json"
            }
        }

@app.post("/mock-settings", status_code=201)
async def create_mock_settings(settings: MockSettings):
    """
    Create and store mock settings for API endpoints.
    
    Accepts a JSON payload with mock configuration and stores it in memory.
    """
    try:
        # Convert Pydantic model to dictionary and store
        settings_dict = settings.model_dump()
        mock_settings_storage.append(settings_dict)
        
        return {
            "success": True,
            "message": "Mock settings saved successfully",
            "settings_id": len(mock_settings_storage) - 1,
            "total_settings": len(mock_settings_storage)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saving mock settings: {str(e)}"
        )

@app.get("/mock-settings")
async def get_all_mock_settings():
    """
    Retrieve all stored mock settings.
    """
    return {
        "success": True,
        "total_settings": len(mock_settings_storage),
        "settings": mock_settings_storage
    }

@app.get("/mock-settings/{settings_id}")
async def get_mock_settings(settings_id: int):
    """
    Retrieve specific mock settings by ID.
    """
    if settings_id < 0 or settings_id >= len(mock_settings_storage):
        raise HTTPException(
            status_code=404,
            detail="Mock settings not found"
        )
    
    return {
        "success": True,
        "settings": mock_settings_storage[settings_id]
    }

@app.delete("/mock-settings")
async def clear_all_mock_settings():
    """
    Clear all stored mock settings.
    """
    global mock_settings_storage
    cleared_count = len(mock_settings_storage)
    mock_settings_storage.clear()
    
    return {
        "success": True,
        "message": f"Cleared {cleared_count} mock settings",
        "total_settings": len(mock_settings_storage)
    }

@app.get("/")
async def root():
    
    return {
        "message": "Mock Settings API",
        "version": "1.0.0",
        "endpoints": {
            "POST /mock-settings": "Create new mock settings",
            "GET /mock-settings": "Get all mock settings",
            "GET /mock-settings/{id}": "Get specific mock settings",
            "DELETE /mock-settings": "Clear all mock settings"
        },
        "total_stored_settings": len(mock_settings_storage)
    }

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def manejar_mock(path: str, request: Request):
    ruta_solicitada = "/" + path
    metodo_solicitado = request.method.upper()

    body = {}
    try:
        body = await request.json()
    except:
        pass  # si no hay body o no es JSON

    headers = dict(request.headers)
    query_params = dict(request.query_params)

    for mock in mock_settings_storage:
        if (
            mock["ruta"] == ruta_solicitada
            and mock["metodo"].upper() == metodo_solicitado
        ):
            contenido = mock["contenido_respuesta"]
            if not isinstance(contenido, str):
                contenido = str(contenido)

            return Response(
                content=contenido,
                status_code=mock["codigo_estado"],
                media_type=mock["content_type"]
)
    return JSONResponse(status_code=404, content={"detalle": "Mock no encontrado"})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
