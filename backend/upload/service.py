import uuid
import os
import shutil
from pathlib import Path

validextensions = ['.png','.jpg','.jpeg','.gif','.bmp','.tif','.tiff','.webp']
uploaddir = Path("uploads")

def validate(file): #

    if '.' not in file: return False

    extension = '.'+file.split('.')[-1]



    return extension in validextensions


def uploaddirchecker():
    if not os.path.isdir("upload"): os.mkdir("upload")


def idgenerator(filename) :
    return str(uuid.uuid4())+'-'+filename


def save(file, name):
    if not validate(file): raise ValueError("invalid file extension")

    safefilename = idgenerator(name)
    filepath = uploaddir/safefilename

    shutil.copyfileobj(file, filepath)


    return safefilename









#print(idgenerator("hi.png"))
