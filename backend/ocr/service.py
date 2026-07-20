import easyocr
from pathlib import Path
import os


print("loading ocr...")
reader = easyocr.Reader(['en'], model_storage_directory="./ocrmodels")
print("loading ocr complete")

def textextracter(imgpath: str):

    if not os.path.isfile(imgpath):
        raise FileNotFoundError

    result = reader.readtext(imgpath)

    dlist = []

    for i in result:
        d = {
            'text': i[1],
            'confidence': i[2]
        }
        dlist.append(d)

    if len(dlist) == 0:
        return [{
            'text': '',
            'confidence': 0
        }]

    return dlist


    pass



def lowconfidencefilterer(dlist, threshold=0.3):

    filteredlist = []
    for i in dlist:
        if i['confidence'] > threshold: filteredlist.append(i)


    return filteredlist




