# import the necessary packages
from pytesseract import Output
import pytesseract
import argparse
import cv2
from src import textFilter as tf
from src import dataStructure as ds
from src import screenshot as ss
import os, shutil

#settings
imagePath = "assets/images/"
images = 67
ignoreImages = [1, 2, 3, 4, 5, 6, 7]

debugMode = False

coordChapters = []

previousTextType = "" # "Losung" or "Chapter" or "MainChapter"
currentMainChapter = None
currentChapter = None

#empty images from output folder
folder = 'assets/output'
for filename in os.listdir(folder):
    file_path = os.path.join(folder, filename)
    try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
    except Exception as e:
        print(e)
        
for i in range(1, images):
    if i in ignoreImages:
        continue
    print("Image: " + str(i))
    #format image name to 0001.jpg
    imageName = str(i)
    if(i < 10):
        imageName = "000" + imageName
    elif(i < 100):
        imageName = "00" + imageName
    elif(i < 1000):
        imageName = "0" + imageName
        
    image = cv2.imread(imagePath + imageName + ".jpg")
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = pytesseract.image_to_data(rgb, output_type=Output.DICT)

    for i in range(0, len(results["text"])):
        # extract the bounding box coordinates of the text region from
        # the current result
        x = results["left"][i]
        y = results["top"][i]
        w = results["width"][i]
        h = results["height"][i]
        # extract the OCR text itself along with the confidence of the
        # text localization
        text = results["text"][i]
        conf = int(results["conf"][i])
        
        if(previousTextType == "MainChapter"):
            currentMainChapter.setTitle(text)
    
        if tf.filterOcrTexts(text, conf, x, y, w, h) == True:
            #print("Confidence: {}".format(conf))
            #print("Text: {}".format(text))#
            if(debugMode):
                text = "".join([c if ord(c) < 128 else "" for c in text]).strip()
                cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(image, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX,
                    1.2, (0, 0, 255), 3)
            
            textType = tf.classifyText(text)
            previousTextType = textType
            print(text, x)
            
            if(textType == "MainChapter"):
                if(currentChapter != None):
                    currentChapter.setNextChapterCoord(x, y)
                    ss.screenshot(currentChapter, image)
                    currentMainChapter.addChapter(currentChapter.getChapterClass())
                    currentChapter = None
                if(currentMainChapter != None):
                    coordChapters.append(currentMainChapter)
                currentMainChapter = ds.MainChapter(text)
            elif(textType == "Chapter"):
                if(currentMainChapter == None):
                    currentMainChapter = ds.MainChapter("Default")
                if(currentChapter != None):
                    currentChapter.setNextChapterCoord(x, y)
                    ss.screenshot(currentChapter, image)
                    currentMainChapter.addChapter(currentChapter.getChapterClass())
                currentChapter = ds.BoundingBoxChapter(text)
                currentChapter.setQuestionCoord(x, y)
            elif(textType == "Losung"):
                if(currentChapter != None):
                    currentChapter.setLosungCoord(x, y)
                
        else:
            previousTextType = ""
        
    #Handle page end
    if(currentChapter != None):
        print('\033[93m' + "Page end" + '\033[0m')
        if(currentChapter.loesungX not in ([], None)):
            print("Losung: " + str(currentChapter.loesungX))
            currentChapter.calculateBoundingBoxes()
            ss.screenshot(currentChapter, image)
            currentMainChapter.addChapter(currentChapter.getChapterClass())
            currentChapter = None
        else:
            print("Lösung on next page")
            currentChapter.calculateBoundingBoxes()
            ss.screenshot(currentChapter, image)
            currentChapter.questionIsRenderd = True
            
    if(debugMode):
        # show the output image
        cv2.imwrite("output.png", image)

if(currentChapter != None):
    ss.screenshot(currentChapter, image)
    currentMainChapter.addChapter(currentChapter.getChapterClass())

coordChapters.append(currentMainChapter)

#delete old index.json if exists
if os.path.exists("assets/index.json"):
  os.remove("assets/index.json")

#write index.json
f = open("assets/index.json", "w")
f.write("{\n")
f.write("  \"chapters\": [\n")
for mainChapter in coordChapters:
    f.write("    {\n")
    f.write("      \"number\": \"" + str(mainChapter.number) + "\",\n")
    f.write("      \"title\": \"" + mainChapter.title + "\",\n")
    f.write("      \"chapters\": [\n")
    for chapter in mainChapter.chapters:
        f.write("        {\n")
        f.write("          \"number\": \"" + str(chapter.number) + "\",\n")
        f.write("          \"losungUrl\": \"" + chapter.getLosungUrl() + "\",\n")
        f.write("          \"questionUrl\": \"" + chapter.getQuestionUrl() + "\"\n")
        f.write("        },\n")
    f.write("      ]\n")
    f.write("    },\n")
f.write("  ]\n")
f.write("}\n")

if(debugMode): 
    #print data structure
    for mainChapter in coordChapters:
        mainChapter.printRecursive()
