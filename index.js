var rp = require('/opt/node_modules/request-promise');
const {Pool, Client} = require('/opt/node_modules/pg');
const request = require("request");
var db_host = process.env.DB_HOST;
var reg = process.env.REGION;


const connectionString = db_host;

function comparePrices(a,b){
    if(a.price === null) return 1;
    if(b.price === null) return -1;
    if (a.price > b.price) return 1;
    if (b.price >= a.price) return -1;
}


function DateFunction(){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    return dateTime;
}
var DrugId=""
const client=new Client({
    connectionString:connectionString
})
client.connect()
var listDrugs = [];
let pricingData1 = {
    //id : "",
    average_price : 0,
    createdat : DateFunction(),  
    difference : 0,
    drug_details_id : 0,
    lowest_market_price : 0,
    pharmacy : "testname",
    price : 0,
    program_id : 0,
    recommended_price : 0, 
    rank:0,
    uncPriceFlag :false
}

//let results =""
let url1 = ""
let url2="";
let data = []
var len=0;
var wrxbody ={}
var query2=""
var values=""
exports.myhandler = async function abc(){
   var res1 = await client.query("SELECT drug_id FROM shuffle_drugs where flag = 'pending' and region = '"+reg+"'");
    for(var i=0; i< res1.rows.length ; i++){
        for(var j=0; j < res1.rows[i].drug_id.length; j++){
            
            listDrugs.push(res1.rows[i].drug_id[j]);
         
        }
    }
    var a=0;
len = listDrugs.length;
console.log(listDrugs);
    for(var k=0; k < len ; k++){
       var drugUrlList = await client.query("SELECT * FROM drug_request where program_id = 0 and drug_name is not null and latitude is not null and longitude is not null and quantity is not null and drug_id :: int = "+listDrugs[k]);
       
       if(drugUrlList.rows.length > 0 ){
          //console.log("********************"+a);
        
        DrugId = parseInt(drugUrlList.rows[0].drug_id);
             var dname=drugUrlList.rows[0].drug_name
             var dquantity = drugUrlList.rows[0].quantity
             var dndc = drugUrlList.rows[0].ndc
              var lat = drugUrlList.rows[0].latitude
               var lng = drugUrlList.rows[0].longitude
                var brand = drugUrlList.rows[0].brand_indicator
       
         wrxbody ={
                    "ndc": dndc, 
                    "latitude": lat, 
                    "longitude": lng,  
                    "quantity": dquantity, 
                    "referrer":"null",
                    "site_identity" : "irx"
                    }
       
        var options = {
                    method: "post",
                    body: wrxbody, 
                    json: true, 
                    url: "https://insiderx.com/request/pharmacies",
                    headers: {
                        // "Referer":"https://www.wellrx.com/prescriptions/"+encodeURI(wrxbody.drugname)+"/08823",
                        "Cookie":"_gcl_au=1.1.1639244140.1555443999; _fbp=fb.1.1555443999440.65320427; _ga=GA1.2.711100002.1555444000; _gid=GA1.2.317294123.1555444000; _hjIncludedInSample=1; _csrf=Z3iefjYKIjIUIEXBJgTix0BY; _gat_UA-113293481-1=1; geocoords=40.7473758%2C-74.05057520000003; AWSALB=6NBPPYHYpRwHG5ONO7yvFP6fzmSCfiDRLUr3FCKprscG4ld2CKg2lU+ZRCxhxrTF55clcMF7APSLyeZBhLeH2pv/9pzCIWt8u9lcfJfF8La8Z/eIpABRoF3orpJj",
                        "X-Requested-With":"XMLHttpRequest",
                        "Accept":"application/json",
                        "csrf-token":"Hi6yGXfg-vppErZsd2KXvKmH9LxjPBNJeK48",
                        
                    }
                   }
       
        try 
        {
            
           await rp(options).then(async function(response){
            var jsondata1 = response;
            var CVSPrice = {};
            CVSPrice.price = null ;
            CVSPrice.pharmacy=null;
            CVSPrice.rank = 0;
            CVSPrice.uncPriceFlag = false;
            var WalmartPrice = {};
            WalmartPrice.price =  null;
            WalmartPrice.pharmacy=null;
            WalmartPrice.rank = 0;
            WalmartPrice.uncPriceFlag = false;
            var WalgreenPrice = {};
            WalgreenPrice.price =  null;
            WalgreenPrice.pharmacy=null;
            WalgreenPrice.rank = 0;
            var KrogerPrice = {};
            KrogerPrice.uncPriceFlag = false;
            KrogerPrice.price =  null ;
            KrogerPrice.pharmacy =null;
            KrogerPrice.rank = 0;
            CVSPrice.uncPriceFlag = false;
            var OtherPrice = {};
            OtherPrice.price =  null ;
            OtherPrice.pharmacy =null;
            OtherPrice.rank = 0;
            OtherPrice.uncPriceFlag = false;
            jsondata1.prices.forEach(function(value){
                if(value!= null){
                    if(value.pharmacy.name.toUpperCase().includes("CVS")){
                        
                        if(CVSPrice.price == null || CVSPrice.price > parseFloat(value.price)){
                            CVSPrice.price =  parseFloat(value.price);
                            CVSPrice.pharmacy=value.pharmacy.name;
                            CVSPrice.uncPriceFlag = false;
                        }
                        if(value.uncPrice != undefined && value.uncPrice != null && CVSPrice.price > parseFloat(value.uncPrice)){
                            CVSPrice.price = parseFloat(value.uncPrice);
                            CVSPrice.pharmacy=value.pharmacy.name;
                            CVSPrice.uncPriceFlag = true;
                        }
                    }else if(value.pharmacy.name.toUpperCase().includes("WAL-MART")){
                        if(WalmartPrice.price == null ||WalmartPrice.price > parseFloat(value.price)){
                            WalmartPrice.price =  parseFloat(value.price);
                            WalmartPrice.pharmacy=value.pharmacy.name;
                            WalmartPrice.uncPriceFlag = false;
                        }
                        if(value.uncPrice != undefined && value.uncPrice != null && WalmartPrice.price > parseFloat(value.uncPrice)){
                            WalmartPrice.price = parseFloat(value.uncPrice);
                            WalmartPrice.pharmacy=value.pharmacy.name;
                            WalmartPrice.uncPriceFlag = true;
                        }
                    }else if(value.pharmacy.name.toUpperCase().includes("WALGREENS")){
                        if(WalgreenPrice.price == null ||WalgreenPrice.price > parseFloat(value.price)){
                            WalgreenPrice.price =  parseFloat(value.price);
                            WalgreenPrice.pharmacy=value.pharmacy.name;
                            WalgreenPrice.uncPriceFlag = false;
                        }
                        if(value.uncPrice != undefined && value.uncPrice != null && WalgreenPrice.price > parseFloat(value.uncPrice)){
                            WalgreenPrice.price = parseFloat(value.uncPrice);
                            WalgreenPrice.pharmacy=value.pharmacy.name;
                            WalgreenPrice.uncPriceFlag = true;
                            
                        }
                    }else if(value.pharmacy.name.toUpperCase().includes("KROGER")){
                        if(KrogerPrice.price == null ||KrogerPrice.price > parseFloat(value.price)){
                            KrogerPrice.price =  parseFloat(value.price);
                            KrogerPrice.pharmacy=value.pharmacy.name;
                            KrogerPrice.uncPriceFlag = false;
                        }
                        if(value.uncPrice != undefined && value.uncPrice != null && KrogerPrice.price > parseFloat(value.uncPrice)){
                            KrogerPrice.price = parseFloat(value.uncPrice);
                            KrogerPrice.pharmacy=value.pharmacy.name;
                            KrogerPrice.uncPriceFlag = true;
                        }
                    }else {
                        if(OtherPrice.price == null ||OtherPrice.price > parseFloat(value.price)){
                            OtherPrice.price =  parseFloat(value.price);
                            OtherPrice.pharmacy=value.pharmacy.name;
                            OtherPrice.uncPriceFlag = false;
                        }
                        if(value.uncPrice != undefined && value.uncPrice != null && OtherPrice.price > parseFloat(value.uncPrice)){
                            OtherPrice.price = parseFloat(value.uncPrice);
                            OtherPrice.pharmacy=value.pharmacy.name;
                            OtherPrice.uncPriceFlag = true;
                        }
                    }
                
                    
                }
            });
            
            var pricesArr = [WalgreenPrice,WalmartPrice,CVSPrice,OtherPrice, KrogerPrice];
            console.log(pricesArr)
            pricesArr.sort(comparePrices)
           
            pricesArr[0].rank = 0;
            pricesArr[1].rank = 1;
            pricesArr[2].rank = 2;
            pricesArr[3].rank = 3;
            pricesArr[4].rank = 4;
            
            console.log(pricesArr)
            pricesArr.forEach(async function (price){
                pricingData1.price = price.price;
                pricingData1.pharmacy = price.pharmacy;
                pricingData1.rank  = price.rank
                pricingData1.uncPriceFlag  = price.uncPriceFlag
                query2 = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price, rank,unc_price_flag) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *';
                values = [pricingData1.average_price, pricingData1.createdat, pricingData1.difference, DrugId, pricingData1.lowest_market_price,pricingData1.pharmacy,pricingData1.price,pricingData1.program_id,pricingData1.recommended_price,pricingData1.rank,pricingData1.uncPriceFlag];
                await client.query(query2, values)
                                .then(res => {
                                })
                                .catch(e => {console.log("errr")})
                
                });
                
                
        
            }).catch(function (err) {
             console.log(err);
                // Crawling failed or Cheerio choked...
            });;
           
       
        } catch (e) {}
        
    }
    else{console.log("fault drugs"+k+"drug-id"+DrugId)}
}
console.log("good drugs:"+a+"drugid:"+DrugId)
    
}


//exports.myhandler()
