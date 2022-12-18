# Valgusfoorid

See projekt on loodud 2022 aasta detsembris TLÜ aine Asjade Internet raames.

Tiimi liikmed: Anneli Põldaru ja Marilii Saar

<br >

## Projekti eesmärk
Projekti eesmärgiks oli luua kokku 4 valgusfoori: 2 füüsilist ja 2 virtuaalset veebis.
Iga foor võib toimida eraldi või kõik foorid võivad töötada koos n-ö rohelises laines.
Fooridel on 3 režiimi: automaatne, nupuvajutusele reageeriv ja öine (vilkuv kollane).

[Anneli fooridest.](https://github.com/Neniariel/trafficlights/blob/main/Anneli/README.md)

[Marilii fooridest.](https://github.com/Neniariel/trafficlights/blob/main/Marilii/README.md)

<br >

## Andmebaasi struktuur
Kasutasime Firebase Realtime andmebaasi.

<img width="186" alt="image" src="https://user-images.githubusercontent.com/42422684/208269110-8fa91b8b-1910-4727-be3a-0a54b1fe8e3d.png">

Igal fooril on andmebaasis oma tabel selleks, kui nad eraldi töötavad. Rohelise laine ajal kasutatakse tabelit `green`. Kui sealses `direction` väljas on sõna 'off',
siis kasutab iga foor oma tabeli andmeid, vastasel juhul on tegemist rohelise lainega ja tuleb kasutada tabelis `green` olevaid andmeid.

<br >

## Juhtpaneel
Valgusfooride juhtimiseks lõime veebilehe, kus saab määrata nii rohelise lainega seotud sätteid kui ka iga foori individuaalseid sätteid:

<img width="950" alt="image" src="https://user-images.githubusercontent.com/42422684/208269379-200dddf8-b68b-4d8d-ad3b-eb677fbe30a0.png">

<br >

## Roheline laine
Rohelise laine fooride järjekord on järgmine:

Marilii füüsiline -> Marilii virtuaalne -> Anneli füüsiline -> Anneli virtuaalne

<br >

## Videod

**Soovitus:** Videoklippide vaatamiseks soovitan need avada täisekraanivaates.  

> Videote filmimisel oli kasutuses 2 mobiiltelefoni, mis kandsid laivis üle füüsiliste fooride videopilti. [OBS Studio](https://obsproject.com/) abil salvestasin ekraanil toimuvat.  

<br >

### Automaatse režiimi video:
 
https://user-images.githubusercontent.com/55189772/208322379-235837f6-60be-484a-9acd-bb1f8382998a.mp4

<br >

### Nupuvajutuse video:

 - Määrates foori uueks režiimiks nupurežiimi, liigub foor ööreziimist välja ja jääb nupuvajutust ootama (autodele roheline & jalakäijatele punane seisundis).  

 - Peale nupuvajutust ootab foor 3s ning seejärel liigub edasi järgmistesse seisunditesse.  

https://user-images.githubusercontent.com/55189772/208322135-f05941b3-780e-4da1-8d03-118186d03993.mp4

<br >

### Rohelise laine video:

 - Videoklipi esimeses pooles toimetab roheline laine suunaga:  
   Marilii NodeMCU -> Marilii virtuaalne -> Anneli NodeMCU -> Anneli virtuaalne.  

 - Ja video teises pooles on laine vastupidise suunaga.  

https://user-images.githubusercontent.com/55189772/208320782-eecefe6b-2823-4491-ab64-a2ce6e0591ab.mp4  
