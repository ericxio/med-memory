from fastapi import APIRouter, UploadFile, File, HTTPException

from . import service
router = APIRouter()



@router.post("/api/upload")
async def upload(file: UploadFile = File(...)):

    try:
        service.save(file.file, file.filename)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))




    json = {"fileid": file.filename, "message": "success"}

    return str(json)


