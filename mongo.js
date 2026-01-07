const mongoose = require("mongoose");

const argv = process.argv;

if (argv.length < 3) {
  console.log("Please input password as argument");
  process.exit(1);
} else if (argv.length !== 3 && argv.length !== 5) {
  console.log("Please input password, name and number.");
  process.exit(1);
}

const password = argv[2];

const name = argv[3];

const number = argv[4];

const url = `mongodb+srv://fullstackopen:${password}@cluster0.zfhlr7q.mongodb.net/phonebook?appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url, { family: 4 });

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Phone = mongoose.model("Phone", phoneSchema);

if (argv.length === 3) {
  Phone.find({}).then((r) => {
    console.log("phonebook:");
    r.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
} else if (argv.length === 5) {
  const phone = new Phone({
    name: name,
    number: number,
  });
  phone.save().then((result) => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  console.log("Please input password, name and number.");
  mongoose.connection.close();
}
