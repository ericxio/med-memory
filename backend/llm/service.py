import json
from openai import OpenAI
from backend.config import openaikey, openaimodel
from backend.llm.prompts import system_prompt, user_prompt_template

def getopenaiclient() -> OpenAI:
    if (openaikey is None):
        raise ValueError("no key provided")

    return OpenAI(api_key=openaikey)

def processtext(ocr_text:str):
    client = getopenaiclient()

    prompt = user_prompt_template.format(ocr_text=ocr_text)

    responce = client.chat.completions.create(
        model=openaimodel,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.2
    )

    resulttext = responce.choices[0].message.content

    result = json.loads(resulttext)

    for i in ["product_name", "strength", "directions", "warnings", "simple_explanation"]:
        if i not in result:
            result[i] = "not found"

    return result

def cleanresult(d):
    fields = ["product_name", "strength", "directions", "warnings", "simple_explanation"]

    for i in fields:
        if i not in d or d[i].lower() == "not found":
            d[i] = None

        else: d[i] = d[i].rstrip().lstrip()

    return d


desc = {'product_name': '      Melatonin', 'strength': '1 mg', 'directions': 'Children 3 to 5 years: consult your doctor for specific dosage; do not exceed one tablet daily. Children 6 to 12 years: chew 2 tablets just prior to or at bedtime. Children 12 years and older: chew three tablets just prior to or at bedtime.', 'warnings': 'Take at bedtime only. Melatonin can induce drowsiness and sleep. Pregnant or nursing women, individuals taking sedatives or other medications, or persons who have a health condition or are experiencing long-term sleep difficulties should consult their doctor before using this product. Do not use alcohol, drive a vehicle, or operate machinery while taking this product. Do not use prior to surgery. Keep out of reach of children. Store at room temperature 59-86°F (15-30°C). Keep bottle tightly closed for your protection. Do not use if printed seal under cap is broken or missing.', 'simple_explanation': 'Children should take the tablets before bedtime as directed.'}


print(cleanresult(desc))