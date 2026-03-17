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




