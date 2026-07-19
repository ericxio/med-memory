import easyocr
from pathlib import Path
import os

reader = easyocr.Reader(['en'])

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


    return dlist


    pass



def lowconfidencefilterer(dlist, threshold=0.3):

    filteredlist = []
    for i in dlist:
        if i['confidence'] > threshold: filteredlist.append(i)


    return filteredlist




print(lowconfidencefilterer(textextracter("test2.png"), 0))