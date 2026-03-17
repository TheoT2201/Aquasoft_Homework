// 1.1. ES6 Methods - examples and explanations
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
console.log(first, second); // 1, 2
var obj = { name: 'Theo', age: 23 };
var nume = obj.name, age = obj.age; // primeam o eroare daca incercam sa folosesc 'name'
console.log(nume, age); // 'Theo', 23
// for...of loop este o sintaxa mai simpla de a itera prin elementele unui array sau ale unui obiect iterabil.
var masini = ['BMW', 'Audi', 'Mercedes'];
for (var _i = 0, masini_1 = masini; _i < masini_1.length; _i++) {
    var masina = masini_1[_i];
    console.log(masina);
} // BMW, Audi, Mercedes
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
