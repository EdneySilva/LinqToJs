// Write your Javascript code.

Array.prototype.asQueryable = function () {
    return new Queryable(this);
}

//var query = [
//    {
//        Name: "Edney",
//        LastName: "Silva",
//        Age: 28,
//        Robbies: [
//            { Name: "Progrraming" },
//            { Name: "LOL" }
//        ]
//    },
//    {
//        Name: "Adriane",
//        LastName: "Querino",
//        Age: 30,
//        Robbies: [
//            { Name: "Watch siries" }
//        ]
//    },
//    {
//        Name: "Jinx",
//        LastName: "Lol",
//        Age: 28,
//        Robbies: [
//            { Name: "Kill" },
//            { Name: "Land" }
//        ]
//    },
//    {
//        Name: "Edney",
//        LastName: "Batista",
//        Age: 18,
//        Robbies: [
//            { Name: "Study" },
//            { Name: "Draw" },
//            { Name: "Driver" }
//        ]
//    },
//    {
//        Name: "Adriane",
//        LastName: "Silva",
//        Age: 30,
//        Robbies: [
//            { Name: "Study" },
//            { Name: "Draw" },
//        ]
//    }
//].asQueryable();

//var array2 = [{
//    Name: "Caitlyn",
//    LastName: "Silva",
//    Elo: "Platina"
//}, {
//    Name: "Adriane",
//    LastName: "Silva",
//    Elo: "Prata"
//    }, {
//        Name: "Edney",
//        LastName: "Silva",
//        Elo: "Bronze"
//}, {
//    Name: "Jinx",
//    LastName: "Silva",
//    Elo: "Diamante"
//}];


//var query2 = query.join(array2, (inner) => inner.Name, (outer) => outer.Name, (inner, outer) => { return { Pessoa: inner, Gamer: outer }}).toArray();

//var ordered = query.orderByDesc(o => o.Name).thenBy(o => o.Age).toArray();
//var grouped = query.where(w => w.Age > 29).groupBy((a) => { return { Name: a.Name, Age: a.Age } }).toArray();

//console.table(query.selectMany((s) => s.Robbies).where(w => w.Name == "Study").toArray());

var contacts = [{ Id: 1, Name: "Monther", Phone: "+55 41 991234-5670" }, { Id: 2, Name: "Father", Phone: "+55 41 991234-5671" }, { Id: 3, Name: "Brother", Phone: "+55 41 991234-5672" }, { Id: 4, Name: "Sister", Phone: "+55 41 991234-5673" }, { Id: 5, Name: "Uncle", Phone: "+55 41 991234-5674" }, { Id: 6, Name: "Aunt", Phone: "+55 41 991234-5675" }, { Id: 7, Name: "Grand Father", Phone: "+55 41 991234-5676" }];
var people = [
    {
        Id: 1,
        Name: "Monther",
        Age: 41,
        Wallet: {
            Money: 500.00
        }
    },
    {
        Id: 2,
        Name: "Father",
        Age: 45,
        Wallet: {
            Money: 600.00
        }
    },
    {
        Id: 3,
        Name: "Brother",
        Age: 10,
        Wallet: {
            Money: 00
        }
    },
    {
        Id: 4,
        Name: "Sister",
        Age: 18,
        Wallet: {
            Money: 100.00
        }
    },
    {
        Id: 5,
        Name: "Uncle",
        Age: 29,
        Wallet: {
            Money: 300.00
        }
    },
    {
        Id: 6,
        Name: "Aunt",
        Age: 30,
        Wallet: {
            Money: 600.00
        }
    },
    {
        Id: 7,
        Name: "Grand Father",
        Age: 80,
        Wallet: {
            Money: 900.00
        }
    }
]

var contactResult = contacts.asQueryable().where(w => w.Id > 3 && w.Id < 6).toArray();
console.log("contacts.asQueryable().where(w => w.Id > 3 && w.Id < 6).toArray();");
console.table(contactResult);

var peopleResult = people.asQueryable().orderBy(o => o.Name).toArray();
console.log("people.asQueryable().orderBy(o => o.Name).toArray();");
console.table(peopleResult);

var famillySalary = people.asQueryable().sum(o => o.Wallet.Money);
console.log("people.asQueryable().sum(o => o.Wallet.Money);");
console.log(famillySalary);

var contactResult2 = contacts.asQueryable().orderByDesc(o => o.Name).toArray();
console.log("contacts.orderByDesc(o => o.Name).toArray();");
console.table(contactResult2);
