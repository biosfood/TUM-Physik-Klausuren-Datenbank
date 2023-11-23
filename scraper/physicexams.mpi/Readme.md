# How to use this Scraper
This scraper is used to scrape the exam results of the physics department of TUM.
Unlike the other scrapers, it cant just fetch the url and parse the html. Since the website is programmed in javascript, the results are loaded dynamically. This means that the scraper would have to simulate a browser and execute the javascript code to get the results. This is too much work for a simple scraper, so the results have to be fetched manually. This is done by executing the following steps:

1. Open the website https://physicsexams.mpi.fs.tum.de/exerciseSet/Klausur
2. Press F12 to open the developer tools and navigate to the network tab
3. On the bottom of the page click on page "1".
4. In the network tab you should see a request to 
https://physicsexams.mpi.fs.tum.de/exerciseSet/Aufgabensammlung?search=&filter_course=&filter_type=&filter_year=&filter_professor=&filter_topics=%5B%5D&sorting=name&page=4&mode=Klausuren&ft=0
5. Copy the content of the response and save it to a new file in the folder "requests" of this scraper. The name of the file should be "page1.html"
6. Repeat steps 3-5 for all pages (1-5) and save the files as "page2.html", "page3.html" and "page4.html"
7. Run the scraper with the command "node physicexams.js"

The results should now be saved in the file "results.json" in the folder "files" of this scraper.