import genanki
import json
import random
import os
from src import dataStructure as ds


abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

#create clean index.json by search and replace ,\s*\n*\s*\] with \n]
""" f = open("assets/index.json", "r")
index = f.read()
f.close()
index = index.replace(",\s*\n*\s*\]", "\n]")
f = open("assets/index.json", "w")
f.write(index)
f.close() """

#read index.json and create anki deck
f = open("assets/index.json", "r")
data = f.read()
f.close()

data = json.loads(data)

chapters = []

for mainChapterJson in data["chapters"]:
    print("MainChapter: " + str(mainChapterJson["number"]))
    mainChapter = ds.MainChapter(mainChapterJson["number"])
    mainChapter.setTitle(mainChapterJson["title"])
    for chapterJson in mainChapterJson["chapters"]:
        print(" Chapter: " + str(chapterJson["number"]))
        chapter = ds.Chapter(chapterJson["number"])
        print(chapterJson)
        chapter.setLosungUrl(chapterJson["losungUrl"])
        chapter.setQuestionUrl(chapterJson["questionUrl"])
        mainChapter.addChapter(chapter)
    chapters.append(mainChapter)
    
print("loaded index.json")
#print(chapters)
for mainChapter in chapters:
    mainChapter.printRecursive()
    
#generate sorterd anki deck

print("generating sorted anki deck")
decks = []
mediaFiles = []

for mainChapter in chapters:
    newDeck = genanki.Deck(
      random.randint(0, 100000),
      "TUM Exphys3 Kurzfragen (sortiert)::" + str(mainChapter.number) + ": " + mainChapter.title
    )
    for chapter in mainChapter.getChapters():
        mediaFiles.append(chapter.getLosungUrl())
        mediaFiles.append(chapter.getQuestionUrl())      
        questionFileName = chapter.getQuestionUrl().split("/")[-1]
        answerFileName = chapter.getLosungUrl().split("/")[-1] 
        formatedQuestion = "<img src=\"" + questionFileName + "\">"
        formatedAnswer = "<img src=\"" + answerFileName + "\">"
        newDeck.add_note(genanki.Note(
          model=genanki.Model(
            2059400111,
            'TUM Exphys3 Kurzfragen',
            fields=[
              {'name': 'Frage'},
              {'name': 'Antwort'},
            ],
            templates=[
              {
                'name': 'Card 1',
                'qfmt': '{{Frage}}',
                'afmt': '{{FrontSide}}<hr id="answer">{{Antwort}}',
              },
            ],
          ),
          fields=[formatedQuestion, formatedAnswer],
        ))
    decks.append(newDeck)


packageChapter = genanki.Package(decks)
packageChapter.media_files = mediaFiles
packageChapter.write_to_file('TUMExphys3Kurzfragen_Sortiert.apkg')

print("successfully generated sorted anki deck")


#generate unsorterd anki deck
print("generating unsorted anki deck")
newDeck = None
newDeck = genanki.Deck(
      random.randint(0, 100000),
      "TUM Exphys3 Kurzfragen"
)
mediaFiles = []

for mainChapter in chapters:
    for chapter in mainChapter.getChapters():
        mediaFiles.append(chapter.getLosungUrl())
        mediaFiles.append(chapter.getQuestionUrl())      
        questionFileName = chapter.getQuestionUrl().split("/")[-1]
        answerFileName = chapter.getLosungUrl().split("/")[-1] 
        formatedQuestion = "<img src=\"" + questionFileName + "\">"
        formatedAnswer = "<img src=\"" + answerFileName + "\">"
        newDeck.add_note(genanki.Note(
          model=genanki.Model(
            2059400112,
            'TUM Exphys3 Kurzfragen',
            fields=[
              {'name': 'Frage'},
              {'name': 'Antwort'},
            ],
            templates=[
              {
                'name': 'Card 1',
                'qfmt': '{{Frage}}',
                'afmt': '{{FrontSide}}<hr id="answer">{{Antwort}}',
              },
            ],
          ),
          fields=[formatedQuestion, formatedAnswer],
        ))


packageChapterUnsorted = genanki.Package(newDeck)
packageChapterUnsorted.media_files = mediaFiles
packageChapterUnsorted.write_to_file('TUMExphys3Kurzfragen.apkg')

print("successfully generated unsorted anki deck")