import qrcode
from PIL import Image

#fonction de la création d'un QR code
def QRCodeGenerator(texte, QRcolor="Black", QRbackground="White", nom_fichier="QRCode1"):

    #création du QR code en image en prenant compte du texte et des couleurs demandé
    QRcode = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H)
    QRcode.add_data(texte)
    QRcode.make()
    QRimg = QRcode.make_image(fill_color=QRcolor, back_color=QRbackground).convert("RGB")

    #création d'un fichier .png en prenant compte du nom du fichier demandé
    nom_fichierPng = nom_fichier+".png"
    QRimg.save(nom_fichierPng)

    #message de confirmation
    print("QR code généré")

#affectation de variable permettant le test de nôtre fonction
texte = input("entrez votre texte ou votre url (https://) : ")
QRcolor = input("quelle couleur voulez vous (en anglais avec une maj) ? : ")
QRbackground = input("quelle couleur de fond voulez vous (en anglais avec une maj) ? : ")
nom_fichier = input("entrez le nom de votre fichier voulu (sans l'extension) : ")

#vérifie les couleur et le texte demandé et les modifie si ils sont vide
if QRcolor == "":
    QRcolor = "Black"
if QRbackground == "":
    if QRcolor == "White":
        QRbackground = "Black"
    else:
        QRbackground = "White"
if nom_fichier == "":
    nom_fichier = "QRCode1"

#activation de la fonction
QRCodeGenerator(texte, QRcolor, QRbackground, nom_fichier)