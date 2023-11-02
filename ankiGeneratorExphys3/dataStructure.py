import random

class MainChapter:
    def __init__(self, number):
        self.number = number
        self.title = ""
        self.chapters = []
        
    def setTitle(self, title):
        self.title = title
        
    def addChapter(self, chapter):
        self.chapters.append(chapter)
    
    def getChapter(self, number):
        for chapter in self.chapters:
            if chapter.number == number:
                return chapter
        return None
    
    def getChapters(self):
        return self.chapters
    
    def printRecursive(self):
        print("MainChapter: " + str(self.number) + " " + self.title)
        for chapter in self.chapters:
            chapter.printRecursive()

class Chapter:
    def __init__(self, number):
        self.number = number
        self.losungUrl = ""
        self.questionUrl = ""
        
    def setLosungUrl(self, url):
        self.losungUrl = url
        
    def setQuestionUrl(self, url):
        self.questionUrl = url
        
    def getLosungUrl(self):
        return self.losungUrl

    def getQuestionUrl(self):
        return self.questionUrl
    
    def printRecursive(self):
        print(" Chapter: " + str(self.number))
        print("   Losung: " + self.losungUrl)
        print("   Question: " + self.questionUrl)
    
class BoundingBoxChapter:
    margin = 15
    boxWidth = 1800
    pageHeight = 3208
    defaultX = 374
    
    def __init__(self, number):
        self.number = number
        self.loesungX = []
        self.questionX = []
        self.nextChapterX = []
        self.loesungBoundingBox = []
        self.questionBoundingBox = []
        
    def setLosungCoord(self, x, y):
        self.loesungX = [x, y]
        self.calculateBoundingBoxes()
        
    def setQuestionCoord(self, x, y):
        self.questionX = [x, y]
        self.calculateBoundingBoxes()
        
    def setNextChapterCoord(self, x,y):
        self.nextChapterX = [x,y]
        self.calculateBoundingBoxes()
        
    def getChapterClass(self):
        chapter = Chapter(self.number)
        chapter.setLosungUrl("assets/output/losung" + str(self.number) + ".png")
        chapter.setQuestionUrl("assets/output/question" + str(self.number) + ".png")
        return chapter
        
    def printRecursive(self):
        print(" Chapter: " + str(self.number))
        print("   Losung: " + str(self.loesungX))
        print("   Question: " + str(self.questionX))
        print("   NextChapter: " + str(self.nextChapterX))
        print("   LosungBoundingBox: " + str(self.loesungBoundingBox))
        print("   QuestionBoundingBox: " + str(self.questionBoundingBox))
        
    def calculateBoundingBoxes(self):
        if(self.nextChapterX == []):
            self.nextChapterX = [self.defaultX, self.pageHeight]
        if(self.loesungX == []):
            self.loesungX = [self.defaultX, self.pageHeight]
            
            
        self.loesungBoundingBox = [self.loesungX[0] - self.margin, self.loesungX[1] - self.margin, self.loesungX[0] + self.boxWidth, self.nextChapterX[1] - self.margin]
        self.questionBoundingBox = [self.questionX[0] - self.margin, self.questionX[1] - self.margin, self.questionX[0] + self.boxWidth, self.loesungX[1] - self.margin]

        
    
        