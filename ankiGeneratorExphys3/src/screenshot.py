import cv2
import os

ouputPath = "assets/output/"
def screenshot(chapter, image):
    if(chapter == None):
        print("\033[93m Chapter is None \033[0m")
        return
    print("ScreenShoting: " + chapter.number)
    #make a screenshot of the losung and question according to the bounding boxes and save the image
    losung = image[chapter.loesungBoundingBox[1]:chapter.loesungBoundingBox[3], chapter.loesungBoundingBox[0]:chapter.loesungBoundingBox[2]]
    question = image[chapter.questionBoundingBox[1]:chapter.questionBoundingBox[3], chapter.questionBoundingBox[0]:chapter.questionBoundingBox[2]]
    
    if(not chapter.questionIsRenderd and question.size > 0):
        cv2.imwrite(ouputPath + "question" + str(chapter.number) + ".png", question)
    
    if(losung.size > 0):
        #check if file exists
        if os.path.exists(ouputPath + "losung" + str(chapter.number) + ".png"):
            #delete old file
            print('\033[93m' + "File already Exists" + "\033[0m")
        cv2.imwrite(ouputPath + "losung" + str(chapter.number) + ".png", losung)
    else:
        print(losung)
        print("Losung is empty")
        print(chapter.loesungBoundingBox)
        #generate empty image
        height, width, channels = image.shape
        losung = image[0:height, 0:width]
        cv2.imwrite(ouputPath + "losung" + str(chapter.number) + ".png", losung)

