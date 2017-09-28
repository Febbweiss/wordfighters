**Word Fighters** is a word game where you must find a maximum words to get the highscore.

How to :
---

When you click on the "Start" button, a combinaison of letters is generated.

The goal is to retrieve a maximum of words with these letters using your keyboard.

To validate a word, simply press the "Enter" key.

To get new letters, press the "Space" bar.
* Easy : Search words between 3 and 7 letters
* Medium : Search words between 3 and 6 letters
* Hard : Search words between 4 and 7 letters
* Extreme : No escape ! You can\'t have new letters before reach all words !
        
If you are blocked, you can switch letters but be careful : you loose 5 points per words not found !!

A live demo is avalaible here

Under the hood :
---
Originally designed to run with a server, it's playable such as.
If running with a server, 2 modes are availables :
* 1 player : Try to beat your highscore. Include the *wordfighters_single.js* to enable the server pipe.
* 2 players : Try to defeat your opponent hitting him/her. The longest the word found is, the stongest damages are !! Include the *wordfighters_multplayer.js* to enable the server pipe.

Words dictionary is provided by the [Scrabble-Resolver](https://github.com/Febbweiss/scrabble-resolver) project.
Currently, only english and french dictionaries are provided.

Credits :
---
+ Graphics : Namco&trade; from "Super Puzzle Fighters 2" and "Super Gems Fighters
+ Code : Fabrice Ecaille aka Febbweiss
+ Tools : gameQuery

Licences :
---
Source code is under [MIT Licence](http://opensource.org/licenses/mit-license.php)