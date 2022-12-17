# Marilii valgusfoorid
Lõin oma valgusfoorid kasutades switch case loogikat - 
igal foori olekul on oma number ning vastavalt sellele, kuhu foor on omadega jõudnud, siis liigub ta edasi järgmisesse faasi.
Enne järgmise faasi määramist kontrollitakse igaks juhuks, ega foor ei ole vahepal liikunud öisesse olekusse.

Ajast kinnipidamine toimib läbi muutujate, sest muido pidasid mikrokontroller ja javascript väga erinevat aega. 
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


## Tulevikuks
* Tulevikus võiks koodi korra üle käia ja seda optimeerida - hetkel on seal kindlasti juppe, mille võib ära kustutada või eraldi funktsiooni tõsta.
* Jalakäia nupuvajutuse funktsiooni alguses peaks olema 3s ooteperiood - hetkel see ei toimi ja see võiks saada parandatud.
* Vilkumise funktsioonid võiks veel korra üle vaadata - hetkel toimivad nad füüsilises ja virtuaalses natuke erinevalt, mistõttu võib karta, et kuskil on mingi kala sees.
