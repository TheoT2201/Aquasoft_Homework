// 1.1. ES6 Methods - examples and explanations


// let este un block-scope variable, adica este vizibil doar in blocul in care a fost declarat,
// fata de var care este vizibil global sau in functia in care a fost declarat. In exemplul de mai jos, avem doua variabile n,
// una declarata in afara blocului si alta declarata in interiorul blocului.
// Variabila n din interiorul blocului va fi vizibila doar in acel bloc, iar variabila n din afara blocului va fi vizibila in tot codul.
// Deci output-ul o sa fie 33 pentru primul log si 22 pentru al doilea.
let n: number = 22;
{
    let n: number = 33;
    console.log(n);
}
console.log(n);


// const este la fel un block-scope variable, dar nu poate fi reasignata dupa ce a fost initializata.
const a: number = 1;
// a = 2;  // eroare


// arrow-function este o sintaxa mai scurta de a scrie functii.
// Nu putem omite doar acoladele sau doar return, ci trebuie ori sa le omitem pe ambele ori sa le folosim pe ambele.
let produs1 = (x: number, y: number): number => x * y;
let produs2 = (x: number, y: number): number => { return x * y };


// Prin destructuring putem extrage valorile dintr-un array sau dintr-un obiect si le putem atribui unor variabile.
const arr = [1, 2, 3];
const [first, second] = arr;
console.log(first, second); // 1 2

const obj: { name: string; age: number } = { name: 'Theo', age: 23 };
const { name: nume, age } = obj; // primeam o eroare daca incercam sa folosesc 'name'
console.log(nume, age); // Theo 23


// for...of loop este o sintaxa mai simpla de a itera prin elementele unui array sau ale unui obiect iterabil.
const masini = ['BMW', 'Audi', 'Mercedes'];
for (const masina of masini) { console.log(masina); } // BMW \n Audi \n Mercedes




// 1.2. Difference between var, let, and const.


// var este variabila care are scope global sau de functie, depinde unde a fost declarata. Aceasta poate fi redeclarata si reasignata
var x: number = 10;
var x: number = 20; // redeclarare
x = 30; // reasignare
console.log(x); // 30


// let este variabila care are scope de bloc, adica este vizibila doar in blocul in care a fost declarata.
// Aceasta poate fi reasignata, dar nu poate fi redeclarata in acelasi scope.
let count: number = 1;
count = 2; // reasignare
// let count: number = 3; // eroare, redeclarare


// const este variabila care are scope de bloc, dar nu poate fi reasignata sau redeclarata dupa ce a fost initializata.
const hello: string = 'Hello';
// hello = 'Hi'; // eroare, reasignare
// const hello: string = 'Hi'; // eroare, redeclarare




// 1.3. TypeScriptTypes and Interfaces – what they are, when to use them, and examples.


// TypeScript types sunt modurile in care poti seta tipurile de date pentru variabile, functii, obiecte etc.

// Exista tipurile primitive cum ar fi number, string si boolean
let numar: number = 42;
let text: string = 'AquaSoft';
let esteAdevarat: boolean = true;
let nr = 42; // TypeScript isi poate da singur seama de tipul de date, nu trebuie specificat in acest caz

// arrays sunt tipuri de date care pot contine mai multe valori de acelasi tip
let fructe: string[] = ['mar', 'banana', 'portocala'];

// any este un tip care poate fi orice, fara un tip specificat
let ceva: any = 5;
ceva = 'Acum este un string';
ceva = true;

let ceva2; // in cazul acesta, TypeScript va considera ca este de tip any ptr ca nu a fost initializat cu o valoare

// functions pot avea tipuri pentru parametri si pentru valoarea returnata
function adunare(a: number, b: number): number {
    return a + b;
}

// acest exemplu arata ca functiile pot fi de tip void, adica nu returneaza nimic
function functie_void(): void {
  // ...
}

// object este un tip care poate contine mai multe proprietati cu tipuri diferite
let coordonate: { x: number; y: number } = { x: 10, y: 20 };

// union types sunt tipuri care pot fi unul dintre mai multe tipuri specificate
let id: number | string = 123;
id = 'abc';

// Type aliases sunt moduri de a da un nume unui tip complex sau unui union type
type Point = { x: number; y: number };
type ID = number | string;


// interfaces sunt moduri de a defini structura unui obiect sau a unei clase.
// Seamana cu type aliases, dar sunt mai flexibile si pot fi extinse
interface Animal {
    name: string;
}
interface Dog extends Animal {
    breed: string;
}
interface Animal {
    sound: string; // putem adauga proprietati noi la interfata existenta
}




// 1.4. Spreadoperator – explanation and usage examples.


// spread operator este un operator care extinde elementele unui array sau ale unui obiect intr-un alt array sau obiect

// cu spread operator putem copia elementele unui array sau ale unui obiect intr-un alt array sau obiect, fara a modifica originalul
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
console.log(arr2); // [1, 2, 3, 4, 5]

// putem combina 2 arrays sau obiecte
const mergedArr = [...arr1, ...arr2];
console.log(mergedArr); // [1, 2, 3, 1, 2, 3, 4, 5]




// 1.5. Objects – how to iterate over an object and how to create a deep copy.


const person1 = {
    name: 'Theo',
    age: 23,
    address: { city: 'Constanta'}
};

const person2 = {
    name: 'Theo',
    age: 23,
    address: { city: 'Constanta'}
};

// pentru a itera peste proprietatile unui obiect, putem folosi for...in loop
for (const key in person1) {
    if (person1.hasOwnProperty(key)) {
        console.log(key, person1[key as keyof typeof person1]);
    }
}

// putem itera peste un array de keys
Object.keys(person1).forEach(key => {
    console.log(key, person1[key as keyof typeof person1]);
});


// shallow copy este o copie superficiala a unui obiect, adica doar referinta la obiectul original este copiata, nu si valorile acestuia
const shallowCopy = { ...person1 };
shallowCopy.address.city = 'Bucuresti';
console.log(person1.address.city); // Bucuresti
console.log(shallowCopy.address.city); // Bucuresti
// ambele obiecte refera aceeasi adresa in memorie deci modificarile aduse adresei in shallowCopy afecteaza si person1

// deep copy este o copie profunda a unui obiect, adica valorile acestuia sunt copiate, nu doar referinta

// exista o biblioteca numita lodash ce are o functie numita cloneDeep

// putem folosi JSON.parse si JSON.stringify pentru a face deep copy dar aceasta nu poate copia functii sau simboluri
const deepCopy = JSON.parse(JSON.stringify(person2));
deepCopy.address.city = 'Bucuresti';
console.log(person2.address.city); // Constanta
console.log(deepCopy.address.city); // Bucuresti
// person2 si deepCopy sunt obiecte diferite in memorie, deci modificarile aduse adresei in deepCopy nu afecteaza person2

// folosind structuredClone putem face o copie profunda a unui obiect, dar aceasta metoda are limitari, cum ar fi faptul ca nu poate copia functii sau simboluri
const copy = structuredClone(person2);
copy.address.city = 'Bucuresti';
console.log(person2.address.city); // Constanta
console.log(copy.address.city); // Bucuresti
// la fel, au adrese diferite in memorie, deci modificarile aduse lui copy nu afecteaza person2




// 1.6. Arrays – accessor, iteration, and mutator methods (what they are and how to use them).


const games = ['CS2', 'LoL', 'Valorant'];

// accessor methods sunt metode care returneaza informatii despre array sau creaza un noi array-uri fara sa il modfiice pe cel original

// lungimea array-ului
console.log(games.length); // 3

// cautam index-ul unui element specific
console.log(games.indexOf('CS2')); // 0

// o parte din array
console.log(games.slice(1, 3)); // ['LoL', 'Valorant']

const newGames = ['Minecraft', 'FC26'];

// concatenarea a doua array-uri
console.log(games.concat(newGames)); // ['CS2', 'LoL', 'Valorant', 'Minecraft', 'FC26']

// unirea elementelor unui array intr-un string
console.log(games.join(', ')); // 'CS2, LoL, Valorant'


// iteration methods returneaza array-uri noi sau valori bazate pe elementele unui array

// forEach itereaza fiecare element si execut o functie pentru fiecare element
games.forEach(game => console.log(game)); // CS2 \n LoL \n Valorant

// map returneaza un nou array cu rezultatele unei functii pe fiecare element
const upperCaseGames = games.map(game => game.toUpperCase());
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
function loadData(callback: (data: string[]) => void): void {
    setTimeout(() => {
        const rezultate = ["item1", "item2", "item3"];
        callback(rezultate);
    }, 1000);
}
loadData((data) => {
    console.log("Date primite:", data);
});


// Promises sunt obiecte care reprezinta o operatie asincrona care poate fi finalizata cu succes sau cu eroare
//.then este metoda care este apelata atunci cand promise reuseste cu succes, iar .catch atunci cand promise da o eroare
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Done!');
  }, 1000);
});

promise.then(result => {
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
// In exemplul acesta, dupa ce m-am conectat la mongodb, am folosit await ca sa astept Track.syncIndexes() sa se finalizeze inainte sa trec mai departe




// 1.9. Closures.


// Closure este o functie care retine variabilele din functia parinte, chiar si dupa ce functia parinte s-a terminat
function outer() {
    let count = 0;

    return function inner() {
        count++;
        console.log(count);
    };
}

const counter = outer();

counter(); // 1
counter(); // 2
counter(); // 3




// 1.10. React Hooks: useState and useRef.
//-Write a small functional React component example demonstrating useState and useRef


// useState este un hook care ne permite sa salvam valori si sa le actualizam in componenta noastra React
// useRef este un hook care ne permite sa salvam o referinta la un element DOM sau o valoare care nu updateaza componeneta atunci cand se schimba
/*
import React, { useState, useRef } from 'react';
export default function Counter() {
    const [count, setCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const increase = () => {
        setCount(count + 1);
    };

    const focusInput = () => {
        inputRef.current?.focus();
    };

    return (
        <div>
            <h2>Count: {count}</h2>

            <button onClick={increase}>Increase</button>

            <br />
            <br />

            <input ref={inputRef} type="text" placeholder="Focus me!" />
            <button onClick={focusInput}>Focus Input</button>
        </div>
    );
}
*/