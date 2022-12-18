# Marilii valgusfoorid
Lõin oma valgusfoorid kasutades switch case loogikat - 
igal foori olekul on oma number ning vastavalt sellele, kuhu foor on omadega jõudnud, siis liigub ta edasi järgmisesse faasi.
Enne järgmise faasi määramist kontrollitakse igaks juhuks, ega foor ei ole vahepal liikunud öisesse olekusse.

Ajast kinnipidamine toimib läbi muutujate, sest muidu pidasid mikrokontroller ja javascript väga erinevat aega. 
Mikrokontrolleri koguajast on maha lahutatud üks sekund, et veeb ja füüsiline foor paremini sünkroonis püsiksid.

## Faasid
Allpool on välja joonistatud valgusfoori loogika erinevad faasid:

| Faas   |                        :car:                    |                :walking:          | :white_medium_square: |            Märkmed..            |    Aeg   |
|  :-:   |                         :-:                     |                   :-:             |          :-:          |              :-:                |    :-:   |
| 0      |  :red_circle: :black_circle: :black_circle:     |  :black_circle: :green_circle:    | :black_circle:        |                                 |    40%   |
| 1      |  :red_circle: :black_circle: :black_circle:     |  :black_circle: :green_circle:    | :black_circle:        | Jalakäija roheline tuli vilgub  |    2s    |
| 2      |  :red_circle: :black_circle: :black_circle:     |  :red_circle: :black_circle:      | :black_circle:        |                                 |    1s    |
| 3      |  :red_circle: :yellow_circle: :black_circle:    |  :red_circle: :black_circle:      | :black_circle:        |                                 |    1s    |
| 4      |  :black_circle: :black_circle: :green_circle:   |  :red_circle: :black_circle:      | :black_circle:        |                                 |    60%   |
| 5      |  :black_circle: :black_circle: :green_circle:   |  :red_circle: :black_circle:      | :black_circle:        | Auto roheline tuli vilgub       |    2s    |
| 6      |  :black_circle: :yellow_circle: :black_circle:  |  :red_circle: :black_circle:      | :black_circle:        |                                 |    1s    |
| 7      |  :red_circle: :black_circle: :black_circle:     |  :red_circle: :black_circle:      | :black_circle:        |                                 |    1s    |
| 8      |  :black_circle: :yellow_circle: :black_circle:  |  :black_circle: :black_circle:    | :black_circle:        | Öö: auto kollane tuli vilgub    |          |


## Nupu režiim
Nupu režiimil püsib süsteem faasis 4 kuni nuppu vajutatakse, seejärel käib tsükli ühe korra läbi ja siis jääb taas faasi 4 pidama, kuni nuppu uuesti vajutatakse.

## Öö
Öö režiimil vilgub auto kollane tuli lõpmatult. Kui öö režiimist väljuda, siis läheb süsteem kõigepealt faasi 2 - nii autol kui jalakäijal on punane tuli ja siis liigub sealt edasi.

## Roheline laine
Rohelise laine tarbeks arvutavad foorid endale viivituse vastavalt laine suunale.
Kui laine suund on paremale, siis MariliiN foor viivitust ei saa ja mariliiV foori viivitus on 1-2 viivituse pikkus.
Kui suund on vasakule, siis on mariliiV viivituse pikkus 2-3 ja 3-4 viivituste summa ja mariliiN foori viivituse pikkus viivituste 1-2, 2-3 ja 3-4 summa.

## Tulevikuks
* Tulevikus võiks koodi korra üle käia ja seda optimeerida - hetkel on seal kindlasti juppe, mille võib ära kustutada või eraldi funktsiooni tõsta.
* Jalakäia nupuvajutuse funktsiooni alguses peaks olema 3s ooteperiood - hetkel see ei toimi ja see võiks saada parandatud.
* Vilkumise funktsioonid võiks veel korra üle vaadata - hetkel toimivad nad füüsilises ja virtuaalses natuke erinevalt, mistõttu võib karta, et kuskil on mingi kala sees.
