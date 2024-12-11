# Slike
Ponavljanje teksture rešite s teksturnimi koordinatami, ne z večjo sliko
Omejite velikost slik (za večino primerov uporabe bo dovolj 256x256 ali 512x512)
Uporabite primeren format:
JPEG je podprt povsod, velikost datotek je lahko precej majhna, če uporabite 4:2:0 podvzorčenje in močno kvantizacijo
WebP je pri dani kvaliteti primerljiv z JPEG in pogosto ustvarja še malenkost manjše datoteke, podprt je v večini sodobnih orodij
AVIF ustvarja najmanjše slike pri dani kvaliteti, toda podprtost je skromna (2023)
Vsi omenjeni formati so odprti in podprti z mnogimi orodji, tudi odprtokodnimi (npr. gimp, imagemagick)
Primer pretvorbe slike v format AVIF z orodjem ffmpeg (kvaliteto lahko uravnavate z -crf, -b:v ipd.):
ffmpeg -i image.png -c:v libaom-av1 -still-picture 1 -s 512x512 -crf 40 image.avif
Primer pretvorbe slike v format AVIF z orodjem imagemagick:
magick image.png -quality 50 image.avif
<br>
# Zvok
Omejite dolžino zvočnih posnetkov
Omejite frekvenco vzorčenja zvočnih posnetkov
Omejite bitno hitrost zvočnih posnetkov
Uporabite primeren format:
MP3 je podprt povsod, velikost datotek je lahko precej majhna
Opus pri dani kvaliteti ustvarja bistveno manjše datoteke kot MP3, podprt je v večini sodobnih orodij
Vsi omenjeni formati so odprti in podprti z mnogimi orodjo, tudi odprtokodnimi (npr. ffmpeg, audacity)
Primer pretvorbe zvočnega posnetka v format Opus z orodjem ffmpeg (kvaliteto lahko uravnavate z -b:a ipd.):
ffmpeg -i audio.mp3 -c:a libopus -b:a 64k audio.opus

<br>
# Video
Omejite ločljivost videa
Omejite slikovno hitrost videa
Omejite bitno hitrost videa
Uporabite primeren format:
AVC/H.264 (pogosto v vsebniku MP4) je podprt povsod, pogosto strojno, velikost datotek je lahko precej majhna, toda format je licenciran
HEVC/H.265 (pogosto v vsebniku MP4) pri dani kvaliteti ustvarja bistveno manjše datoteke kot H.264, podprt je v sodobnih orodjih
VP8 (pogosto v vsebniku WebM) je odprt format, konkurenca H.264, podprt je v večini sodobnih orodij
VP9 (pogosto v vsebniku WebM) je odprt format, konkurenca H.265, podprt je v večini sodobnih orodij
AV1 (pogosto v vsebniku MKV) je odprt format, naslednik VP9, pri dani kvaliteti ustvarja zelo majhne datoteke, podprtost je skromna (2023)
Primer pretvorbe videa v format H.264 z orodjem ffmpeg (kvaliteto lahko uravnavate z -crf, -b:v ipd.):
ffmpeg -i video.mov -c:v libx264 -s 1280x720 -crf 30 video.mp4

<br>
# Poligonski modeli
Omejite količino oglišč in trikotnikov (npr. z uporabo Blender decimate modifier)
Objekte podvajajte brez podvajanja geometrije (Blender Alt-D namesto Shift-D)
Uporabite primeren format:
OBJ hrani geometrijo v tekstovni obliki, ne hrani materialov, hierarhije, luči, tekstur, animacij, zato so potrebne zunanje datoteke
PLY hrani geometrijo v binarni ali tekstovni obliki, ne hrani materialov, hierarhije, luči, tekstur, animacij, zato so potrebne zunanje datoteke
glTF (pogosto v vsebniku GLB) hrani geometrijo, hierarhijo, materiale, teksture, luči, animacije, uporablja format JSON za opis virov
Lahko uporabite tudi kompresijo geometrije (npr. format Draco)
