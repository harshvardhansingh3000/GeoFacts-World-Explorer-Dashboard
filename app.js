import express from 'express';
import path from 'path';    
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { config } from 'dotenv';
import axios from 'axios';
import bodyparser from 'body-parser';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public'))); 
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));


app.get('/',(req,res)=>{
    res.render('map');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
