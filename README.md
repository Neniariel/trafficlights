#Valgusfoorid

See projekt on loodud 2022 aasta detsembris TLÜ aine Asjade Internet raames.

Tiimi liikmed: Anneli Põldaru ja Marilii Saar

##Projekti eesmärk
Projekti eesmärgiks oli luua kokku 4 valgusfoori: 2 füüsilist ja 2 virtuaalset veebis.
Iga foor võib toimida eraldi või kõik foorid võivad töötada koos n-ö rohelises laines.
Fooridel on 3 režiimi: automaatne, nupuvajutusele reageeriv ja öine (vilkuv kollane).
Anneli fooridest.
Marilii fooridest.

##Andmebaasi struktuur
Kasutasime Firebase Realtime andmebaasi.
Igal fooril on andmebaasis oma tabel selleks, kui nad eraldi töötavad. Rohelise laine ajal kasutatakse tabelid 'green'. Kui sealses 'direction' väljas on sõna 'off',
siis kasutab iga foor oma tabeli andmeid, vastasel juhul on tegemist rohelise lainega ja tuleb kasutada tabelis 'green' olevaid andmeid.
