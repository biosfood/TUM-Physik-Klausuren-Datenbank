# Read text from a pdf file

import PyPDF2
import re
import os

abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

# Open the pdf file
filename = 'assets/Kurzfragensammlung_Ex3.pdf'
pdfFileObj = open(filename, 'rb')

# Read the pdf file
pdfReader = PyPDF2.PdfReader(pdfFileObj)

# Get the number of pages
num_pages = len(pdfReader.pages)

# Print the content of the pdf
count = 0
text = ""
""" 
while count < num_pages:
    pageObj = pdfReader.pages[count]
    count +=1
    text += pageObj.extract_text() """

pageObj = pdfReader.pages[7]
text += pageObj.extract_text()

print(text)
