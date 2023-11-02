
min_conf = 20
x_max = 380

def filterOcrTexts(text, conf, left, top, width, height):
    if conf < min_conf:
        return False
    
    if text == "":
        return False
    
    if text == "Losung":
        return True
    
    #check if text contains a number
    if any(char.isdigit() for char in text):
        if(len(text) > 5):
            return False
        if(left > x_max):
            return False
        return True
    
def classifyText(text):
    #trim text
    text = text.strip()
    #if the last character is a dot, remove it (artefact from OCR)
    if(text.endswith(".")):
        text = text[:-1]
    
    if(text == "Losung"):
        return "Losung"
    
    #MainChapter if no dot or if a dot exits but no number after the dot
    if (text.count(".") == 0 and any(char.isdigit() for char in text)) or (text.count(".") == 1 and not text.split(".")[1].isdigit()):
        return "MainChapter"
    
    #Chapter if in the format 1.11
    if(text.count(".") == 1):
        return "Chapter"
    
    return ""