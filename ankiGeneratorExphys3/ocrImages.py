# import the necessary packages
from pytesseract import Output
import pytesseract
import argparse
import cv2
import textFilter as tf
import dataStructure as ds
import screenshot as ss

#settings
imagePath = "assets/images/"
images = 66
ignoreImages = [1, 2, 3, 4, 5, 6, 7]

debugMode = False

coordChapters = []

previousTextType = "" # "Losung" or "Chapter" or "MainChapter"
currentMainChapter = None
currentChapter = None

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
            
            textType = tf.classifyText(text)
            previousTextType = textType
            
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
            

            if(debugMode):
                text = "".join([c if ord(c) < 128 else "" for c in text]).strip()
                cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(image, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX,
                    1.2, (0, 0, 255), 3)
        else:
            previousTextType = ""

ss.screenshot(currentChapter, image)
currentMainChapter.addChapter(currentChapter)
coordChapters.append(currentMainChapter)

if(debugMode): 
#draw all bounding boxes
    for mainChapter in coordChapters:
        for chapter in mainChapter.getChapters():
            cv2.rectangle(image, (chapter.loesungBoundingBox[0], chapter.loesungBoundingBox[1]), (chapter.loesungBoundingBox[2], chapter.loesungBoundingBox[3]), (255, 0, 0), 2)
            cv2.rectangle(image, (chapter.questionBoundingBox[0], chapter.questionBoundingBox[1]), (chapter.questionBoundingBox[2], chapter.questionBoundingBox[3]), (255, 0, 0), 2)
    
    #print data structure
    for mainChapter in coordChapters:
        mainChapter.printRecursive()
    
    # show the output image
    cv2.imwrite("output.png", image)