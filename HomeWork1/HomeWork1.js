// 1.1. ES6 Methods - examples and explanations
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// let este un block-scope variable, adica este vizibil doar in blocul in care a fost declarat,
// fata de var care este vizibil global sau in functia in care a fost declarat. In exemplul de mai jos, avem doua variabile n,
// una declarata in afara blocului si alta declarata in interiorul blocului.
// Variabila n din interiorul blocului va fi vizibila doar in acel bloc, iar variabila n din afara blocului va fi vizibila in tot codul.
// Deci output-ul o sa fie 33 pentru primul log si 22 pentru al doilea.
var n = 22;
{
    var n_1 = 33;
    console.log(n_1);
}
console.log(n);
// const este la fel un block-scope variable, dar nu poate fi reasignata dupa ce a fost initializata.
var a = 1;
// a = 2;  // eroare
// arrow-function este o sintaxa mai scurta de a scrie functii.
// Nu putem omite doar acoladele sau doar return, ci trebuie ori sa le omitem pe ambele ori sa le folosim pe ambele.
var produs1 = function (x, y) { return x * y; };
var produs2 = function (x, y) { return x * y; };
// Prin destructuring putem extrage valorile dintr-un array sau dintr-un obiect si le putem atribui unor variabile.
var arr = [1, 2, 3];
var first = arr[0], second = arr[1];
console.log(first, second); // 1 2
var obj = { name: 'Theo', age: 23 };
var nume = obj.name, age = obj.age; // primeam o eroare daca incercam sa folosesc 'name'
console.log(nume, age); // Theo 23
// for...of loop este o sintaxa mai simpla de a itera prin elementele unui array sau ale unui obiect iterabil.
var masini = ['BMW', 'Audi', 'Mercedes'];
for (var _i = 0, masini_1 = masini; _i < masini_1.length; _i++) {
    var masina = masini_1[_i];
    console.log(masina);
} // BMW \n Audi \n Mercedes
// 1.2. Difference between var, let, and const.
// var este variabila care are scope global sau de functie, depinde unde a fost declarata. Aceasta poate fi redeclarata si reasignata
var x = 10;
var x = 20; // redeclarare
x = 30; // reasignare
console.log(x); // 30
// let este variabila care are scope de bloc, adica este vizibila doar in blocul in care a fost declarata.
// Aceasta poate fi reasignata, dar nu poate fi redeclarata in acelasi scope.
var count = 1;
count = 2; // reasignare
// let count: number = 3; // eroare, redeclarare
// const este variabila care are scope de bloc, dar nu poate fi reasignata sau redeclarata dupa ce a fost initializata.
var hello = 'Hello';
// hello = 'Hi'; // eroare, reasignare
// const hello: string = 'Hi'; // eroare, redeclarare
// 1.3. TypeScriptTypes and Interfaces – what they are, when to use them, and examples.
// TypeScript types sunt modurile in care poti seta tipurile de date pentru variabile, functii, obiecte etc.
// Exista tipurile primitive cum ar fi number, string si boolean
var numar = 42;
var text = 'AquaSoft';
var esteAdevarat = true;
var nr = 42; // TypeScript isi poate da singur seama de tipul de date, nu trebuie specificat in acest caz
// arrays sunt tipuri de date care pot contine mai multe valori de acelasi tip
var fructe = ['mar', 'banana', 'portocala'];
// any este un tip care poate fi orice, fara un tip specificat
var ceva = 5;
ceva = 'Acum este un string';
ceva = true;
var ceva2; // in cazul acesta, TypeScript va considera ca este de tip any ptr ca nu a fost initializat cu o valoare
// functions pot avea tipuri pentru parametri si pentru valoarea returnata
function adunare(a, b) {
    return a + b;
}
// acest exemplu arata ca functiile pot fi de tip void, adica nu returneaza nimic
function functie_void() {
    // ...
}
// object este un tip care poate contine mai multe proprietati cu tipuri diferite
var coordonate = { x: 10, y: 20 };
// union types sunt tipuri care pot fi unul dintre mai multe tipuri specificate
var id = 123;
id = 'abc';
// 1.4. Spreadoperator – explanation and usage examples.
// spread operator este un operator care extinde elementele unui array sau ale unui obiect intr-un alt array sau obiect
// cu spread operator putem copia elementele unui array sau ale unui obiect intr-un alt array sau obiect, fara a modifica originalul
var arr1 = [1, 2, 3];
var arr2 = __spreadArray(__spreadArray([], arr1, true), [4, 5], false);
console.log(arr2); // [1, 2, 3, 4, 5]
// putem combina 2 arrays sau obiecte
var mergedArr = __spreadArray(__spreadArray([], arr1, true), arr2, true);
console.log(mergedArr); // [1, 2, 3, 1, 2, 3, 4, 5]
// 1.5. Objects – how to iterate over an object and how to create a deep copy.
var person1 = {
    name: 'Theo',
    age: 23,
    address: { city: 'Constanta' }
};
var person2 = {
    name: 'Theo',
    age: 23,
    address: { city: 'Constanta' }
};
// pentru a itera peste proprietatile unui obiect, putem folosi for...in loop
for (var key in person1) {
    if (person1.hasOwnProperty(key)) {
        console.log(key, person1[key]);
    }
}
// putem itera peste un array de keys
Object.keys(person1).forEach(function (key) {
    console.log(key, person1[key]);
});
// shallow copy este o copie superficiala a unui obiect, adica doar referinta la obiectul original este copiata, nu si valorile acestuia
var shallowCopy = __assign({}, person1);
shallowCopy.address.city = 'Bucuresti';
console.log(person1.address.city); // Bucuresti
console.log(shallowCopy.address.city); // Bucuresti
// ambele obiecte refera aceeasi adresa in memorie deci modificarile aduse adresei in shallowCopy afecteaza si person1
// deep copy este o copie profunda a unui obiect, adica valorile acestuia sunt copiate, nu doar referinta
// exista o biblioteca numita lodash ce are o functie numita cloneDeep
// putem folosi JSON.parse si JSON.stringify pentru a face deep copy dar aceasta nu poate copia functii sau simboluri
var deepCopy = JSON.parse(JSON.stringify(person2));
deepCopy.address.city = 'Bucuresti';
console.log(person2.address.city); // Constanta
console.log(deepCopy.address.city); // Bucuresti
// person2 si deepCopy sunt obiecte diferite in memorie, deci modificarile aduse adresei in deepCopy nu afecteaza person2
// folosind structuredClone putem face o copie profunda a unui obiect, dar aceasta metoda are limitari, cum ar fi faptul ca nu poate copia functii sau simboluri
var copy = structuredClone(person2);
copy.address.city = 'Bucuresti';
console.log(person2.address.city); // Constanta
console.log(copy.address.city); // Bucuresti
// la fel, au adrese diferite in memorie, deci modificarile aduse lui copy nu afecteaza person2
// 1.6. Arrays – accessor, iteration, and mutator methods (what they are and how to use them).
var games = ['CS2', 'LoL', 'Valorant'];
// accessor methods sunt metode care returneaza informatii despre array sau creaza un noi array-uri fara sa il modfiice pe cel original
// lungimea array-ului
console.log(games.length); // 3
// cautam index-ul unui element specific
console.log(games.indexOf('CS2')); // 0
// o parte din array
console.log(games.slice(1, 3)); // ['LoL', 'Valorant']
var newGames = ['Minecraft', 'FC26'];
// concatenarea a doua array-uri
console.log(games.concat(newGames)); // ['CS2', 'LoL', 'Valorant', 'Minecraft', 'FC26']
// unirea elementelor unui array intr-un string
console.log(games.join(', ')); // 'CS2, LoL, Valorant'
// iteration methods returneaza array-uri noi sau valori bazate pe elementele unui array
// forEach itereaza fiecare element si execut o functie pentru fiecare element
games.forEach(function (game) { return console.log(game); }); // CS2 \n LoL \n Valorant
// map returneaza un nou array cu rezultatele unei functii pe fiecare element
var upperCaseGames = games.map(function (game) { return game.toUpperCase(); });
console.log(upperCaseGames); // ['CS2', 'LOL', 'VALORANT']
// mutator methods modifica array-ul original
// push adauga un element la sfarsit
newGames.push('Elden Ring');
console.log(newGames); // ['Minecraft', 'FC26', 'Elden Ring']
// pop elimina ultimul element
newGames.pop();
console.log(newGames); // ['Minecraft', 'FC26']
// shift elimina primul element
newGames.shift();
console.log(newGames); // ['FC26']
// unshift adauga un element la inceput
newGames.unshift('Minecraft');
console.log(newGames); // ['Minecraft', 'FC26']
// splice poate adauga sau elimina elemente la o pozitie specifica
newGames.splice(1, 0, 'Elden Ring');
console.log(newGames); // ['Minecraft', 'Elden Ring', 'FC26']
// 1.7. Promises and Callbacks.
// Callbacks sunt functii care sunt trecute ca argumente altor functii si sunt apelate dupa ce o anumita operatie este finalizata
function loadData(callback) {
    setTimeout(function () {
        var rezultate = ["item1", "item2", "item3"];
        callback(rezultate);
    }, 1000);
}
loadData(function (data) {
    console.log("Date primite:", data);
});
// Promises sunt obiecte care reprezinta o operatie asincrona care poate fi finalizata cu succes sau cu eroare
var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('Done!');
    }, 1000);
});
promise.then(function (result) {
    console.log(result);
});
// 1.8. Async / Await.
// Async / Await este o sintaxa care face codul asincron sa arate si sa se comporte ca un cod sincron, folosindu-se de Promises la baza
/*
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Conectat la MongoDB');

    await Track.syncIndexes();
    console.log('Track indexes synced');
  })
  .catch(err => console.error('Eroare conectare MongoDB:', err));
*/ 
