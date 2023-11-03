
min_conf = 20
x_max = 380
min_height = 30

def filterOcrTexts(text, conf, left, top, width, height):
    if conf < min_conf:
        return False
    
    if text == "":
        return False
    
    if text == "Losung":
        return True
    
    #check if first character is a number
    if text[0].isdigit():
        if(len(text) > 5):
            return False
        #check if text contains special characters except for dots
        if not any(char.isdigit() or char == "." for char in text):
            return False
        
        if(left > x_max):
            return False
        
        if(height < min_height):
            return False
        return True
    
    return False
    
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
        print(text)
        return "MainChapter"
    
    #Chapter if in the format 1.11
    if(text.count(".") == 1):
        return "Chapter"
    
    return ""