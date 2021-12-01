const {google} = require('googleapis');
const keys = require('./keys.json');
const express = require('express');
const path = require ('path');
const port = process.env.PORT || 1337;

const app = express();

app.use(express.urlencoded({extended:true}));

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

const client = new google.auth.JWT(
    keys.client_email,
    null, 
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);


app.get('/id/:char_id',(req,res)=>{
    var id = req.params.char_id;
    // res.send(id);

    client.authorize(async function(err,tokens){
        if(err)
        {
            console.log(err);
            return;
        }
        else
        {
            // console.log('connected!');
            let infoObj = await gsrun(client,id);
            // console.log(infoObj);
            if(Object.keys(infoObj).length === 0 && infoObj.constructor === Object)
            {
                res.status(404).render('notExist', infoObj);
            }
            else
            res.status(200).render('exist', infoObj);
            
        }
    });
})




async function gsrun(client,id)
{
    const gsapi = google.sheets({version: "v4" , auth: client});
    const opt = {
        spreadsheetId : '1A29HYqyOaSHWpnJsYiOY6hfe0FFCaT3G2NT2Oejx7NQ',
        range: 'Data'
    };
    // range: 'Data!A2:B5'
    let info = await gsapi.spreadsheets.values.get(opt);
    let dataArray = info.data.values;
    // console.log(dataArray.length);
    let toBeSearched = id;
    let found = false;
    let index = -1;

    dataArray.forEach(item=>{
        // console.log(item[0]);
        if(toBeSearched===item[0])
        {
            found = true;
            index = item[1];
            return;
        }
    });
    
    if(found)
    {
        // index++;
        // console.log(index);
        const opt2 = {
            spreadsheetId : '1A29HYqyOaSHWpnJsYiOY6hfe0FFCaT3G2NT2Oejx7NQ',
            range: 'Sheet1'
        };
        let info = await gsapi.spreadsheets.values.get(opt2);
        let dataArray = info.data.values;
        // dataArray.forEach(item=>{
        //     console.log(item);
        // })
        index--;
        // console.log(dataArray[index]);

        // console.log("Name",dataArray[index][3]);
        // console.log("Email",dataArray[index][1]);

        // let infoArray = [dataArray[index][0],dataArray[index][1]];
        let fname = dataArray[index][1];
        let lname = dataArray[index][2];
        let name = fname + ' ' + lname;
        let infoObj = {
            'name' : name,
            'email': dataArray[index][3],
            'spec' : dataArray[index][6]
        };
        // console.log(infoObj);
        return infoObj;
        // res.send(dataArray[index][0]);

    }
    else
    {
        console.log("Not found");
        let infoObj = {};
        return infoObj;
    }
    
}



app.listen(port,(req,res)=>{
    console.log('port is running on 1337');
})
