import uuid
import os
import shutil
from pathlib import Path

validextensions = ['.png','.jpg','.jpeg','.gif','.bmp','.tif','.tiff','.webp']
uploaddir = Path(__file__).parent.parent.parent / Path("uploads")



def validate(file): #

    if '.' not in file: return False

    extension = '.'+file.split('.')[-1]



    return extension in validextensions


def uploaddirchecker():
    if not os.path.isdir("../uploads"): os.mkdir("../uploads")


def idgenerator(filename) :
    return str(uuid.uuid4())+'-'+filename


def save(file, name):
    if not validate(name): raise ValueError("invalid file extension")

    safefilename = idgenerator(name)
    filepath = uploaddir/safefilename

    print("file saved to " + str(filepath))


    with open(filepath, 'wb') as f:
        shutil.copyfileobj(file, f)


    return safefilename




#uploaddirchecker()




#print(idgenerator("hi.png"))
