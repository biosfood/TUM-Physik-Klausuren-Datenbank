## Install (WSL2)

Requirements:

- python 3.6+
- pip3

Installing:

- Install tesseract:

```
sudo apt install tesseract-ocr
sudo apt install libtesseract-dev
```

- Install Pillow:

```
python3 -m pip install --upgrade pip
python3 -m pip install --upgrade Pillow
```

- Install pytesseract:

```
pip3 install pytesseract
```

- Install opencv:

```
pip3 install opencv-contrib-python
```

- Install genanki:

```
pip3 install genanki
```

## Generate the dataset:

```

python3 ocrImages.py

```

## Generate Ankis:

```

python3 generateAnki.py

```

## Clean up Index file:

The generated Index file has some extra characters that need to be removed. Use the following regex to clean it up:

Regex search : ,\s*\n*\s\*\]

Replace with: ]
