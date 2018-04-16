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
