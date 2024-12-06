const express = require('express');
const exphbs = require('express-handlebars');
const app = express();

app.use(express.static('public'));

const expressHandlebars = require('express-handlebars')
app.engine('handlebars',expressHandlebars.engine({
    defaultLayout: 'main',
}))
app.set('view engine','handlebars')

const PORT = process.env.PORT || 3000;

app.get("/",(req,res)=>{
    res.render('page',{req})
})



app.use((request,response)=>{
    response.status(404)
    response.render('404')
})
app.use((error,request,response,next)=>{
    console.log(error.message)
    response.status(500)
    response.render('500')
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

