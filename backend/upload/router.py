from fastapi import APIRouter, UploadFile, File, HTTPException

from . import service
router = APIRouter()



@router.post("/api/upload")
async def upload(file: UploadFile = File(...)):

    try:
        fileid = service.save(file.file, file.filename)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))




    json = {"fileid": fileid, "message": "success"}

    return json


