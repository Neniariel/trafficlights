# Valgusfoorid

See projekt on loodud 2022 aasta detsembris TLÜ aine Asjade Internet raames.

Tiimi liikmed: Anneli Põldaru ja Marilii Saar

## Projekti eesmärk
Projekti eesmärgiks oli luua kokku 4 valgusfoori: 2 füüsilist ja 2 virtuaalset veebis.
Iga foor võib toimida eraldi või kõik foorid võivad töötada koos n-ö rohelises laines.
Fooridel on 3 režiimi: automaatne, nupuvajutusele reageeriv ja öine (vilkuv kollane).

[Anneli fooridest.](https://github.com/Neniariel/trafficlights/blob/main/Anneli/README.md)

[Marilii fooridest.](https://github.com/Neniariel/trafficlights/blob/main/Marilii/README.md)

## Andmebaasi struktuur
Kasutasime Firebase Realtime andmebaasi.

<img width="186" alt="image" src="https://user-images.githubusercontent.com/42422684/208269110-8fa91b8b-1910-4727-be3a-0a54b1fe8e3d.png">

Igal fooril on andmebaasis oma tabel selleks, kui nad eraldi töötavad. Rohelise laine ajal kasutatakse tabelid 'green'. Kui sealses 'direction' väljas on sõna 'off',
siis kasutab iga foor oma tabeli andmeid, vastasel juhul on tegemist rohelise lainega ja tuleb kasutada tabelis 'green' olevaid andmeid.
