const mongoose = require('mongoose');
const Classe = require('./Backend/models/Classe');
require('dotenv').config({ path: './Backend/.env' });

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const classe = await Classe.findOne();
  if(!classe) return console.log("No class found");
  
  console.log("Original: ", classe);
  try {
      const updated = await Classe.findByIdAndUpdate(classe._id, {
          filiere: 'Technique',
          serie: 'Test',
          niveau: 'Terminale',
          section: 'X'
      }, { new: true, runValidators: true });
      console.log("Updated: ", updated);
  } catch(e) {
      console.error("Error: ", e.message);
  }
  process.exit(0);
}
test();
