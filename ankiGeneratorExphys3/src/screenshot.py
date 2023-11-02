import cv2

ouputPath = "assets/output/"
def screenshot(chapter, image):
    print("ScreenShoting: " + chapter.number)
    #make a screenshot of the losung and question according to the bounding boxes and save the image
    losung = image[chapter.loesungBoundingBox[1]:chapter.loesungBoundingBox[3], chapter.loesungBoundingBox[0]:chapter.loesungBoundingBox[2]]
    question = image[chapter.questionBoundingBox[1]:chapter.questionBoundingBox[3], chapter.questionBoundingBox[0]:chapter.questionBoundingBox[2]]
    if(not chapter.questionIsRenderd and question.size > 0):
        cv2.imwrite(ouputPath + "question" + str(chapter.number) + ".png", question)
    
    if(losung.size > 0):
        cv2.imwrite(ouputPath + "losung" + str(chapter.number) + ".png", losung)
    