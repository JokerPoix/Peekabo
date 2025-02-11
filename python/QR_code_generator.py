import qrcode
from PIL import Image

def QRCodeGenerator(texte, QRcolor="Black", QRbackground="White", nom_fichier="QRCode1"):

    QRcode = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H)
    QRcode.add_data(texte)
    QRcode.make()
    QRimg = QRcode.make_image(fill_color=QRcolor, back_color=QRbackground).convert("RGB")

    nom_fichierPng = nom_fichier+".png"
    QRimg.save(nom_fichierPng)

    print("QR code généré")

texte = input("entrez votre texte ou votre url (https://) : ")
QRcolor = input("quelle couleur voulez vous (en anglais avec une maj) ? : ")
QRbackground = input("quelle couleur de fond voulez vous (en anglais avec une maj) ? : ")
nom_fichier = input("entrez le nom de votre fichier voulu (sans l'extension) : ")

if QRcolor == "":
    QRcolor = "Black"
if QRbackground == "":
    if QRcolor == "White":
        QRbackground = "Black"
    else:
        QRbackground = "White"
if nom_fichier == "":
    nom_fichier = "QRCode1"

QRCodeGenerator(texte, QRcolor, QRbackground, nom_fichier)