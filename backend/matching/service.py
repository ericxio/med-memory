from rapidfuzz import fuzz
from backend.cards import service as cardservice
from backend.ocr import service as ocrservice
from backend.config import upload_dir
from backend.config import ocrthreshold
from pathlib import Path

uploaddir = Path(__file__).parent.parent.parent / Path("uploads")
threshold = 60

def similarity(a,b):
    if a is None or b is None or len(a) == 0 or len(b) == 0: return 0.0;

    a = a.lower().rstrip().lstrip()
    b = b.lower().rstrip().lstrip()

    basicscore = fuzz.ratio(a, b)
    partialscore = fuzz.partial_ratio(a, b)
    tokenscore = fuzz.token_sort_ratio(a, b)

    return max(basicscore, partialscore, tokenscore)



def findmatch(text):
    realtext = ocrservice.textextracter(text)
    print(realtext)
    cards = cardservice.getallcards(
    )

    message = {
            "matched": False,
            "best_score": 0.0,
            "best_product": None,
            "message": "no cards saved"
        }

    if len(cards) == 0: return message

    for i in cards:
        score = similarity(realtext, i["ocr_text"])
        if score > message["best_score"]:
            #message["matched"] = True
            message["best_score"] = score
            message["best_product"] = i.product_name
            #message["message"] = "card found"

    if message["best_score"] > threshold:
        message['matched'] = True
        message["message"] = "card found"

    return message

#     return
#
# a="the fintesgram pacert est is a mlti stage aerobiec capacit test that progresively gets more difficutl as ti continues     "
# b="The FitnessGram Pacer test is a multistage aerobic capacity test that progressively gets more difficult as it continues. "
#
# print(similarity(a,b))
#

def matchbyimage(image):
    path = uploaddir / image
    ocrtext = ocrservice.lowconfidencefilterer(ocrservice.textextracter(path), threshold=ocrthreshold)

    return findmatch(ocrtext)







